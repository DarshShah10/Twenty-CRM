import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { QUOTE_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
import { api, list, schemaMapping } from 'src/lib/twenty-api';

export const handler = async (event: RoutePayload) => {
  const secret = process.env.INVOIFY_SESSION_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error('Signing secret is not configured');
  const raw = event.rawBody || JSON.stringify(event.body);
  const signature = event.headers['x-invoify-signature'] || event.headers['X-Invoify-Signature'] || '';
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
    throw new Error('Callback signature is invalid');
  const body = event.body as any;
  const [claimsBody, claimsSignature, extra] = String(body.sessionToken || '').split('.');
  const expectedClaims = createHmac('sha256', secret).update(claimsBody || '').digest('base64url');
  if (extra || claimsSignature?.length !== expectedClaims.length || !timingSafeEqual(Buffer.from(claimsSignature), Buffer.from(expectedClaims)))
    throw new Error('Session signature is invalid');
  const session = JSON.parse(Buffer.from(claimsBody, 'base64url').toString());
  const m = schemaMapping();
  if (session.expiresAt <= Date.now() || session.sourceObject !== m.source || session.sourceRecordId !== body.sourceRecordId || !/^[0-9a-f-]{36}$/i.test(session.sessionId))
    throw new Error('Session expired or source mismatch');
  const runtimeClaims = JSON.parse(Buffer.from(process.env.TWENTY_APP_ACCESS_TOKEN!.split('.')[1], 'base64url').toString());
  if (session.workspaceId !== runtimeClaims.workspaceId) throw new Error('Workspace mismatch');
  const doc = body.document;
  const fingerprint = createHash('sha256').update(JSON.stringify(doc)).digest('hex');
  if (doc?.documentType !== 'quotation' || !/^[A-Za-z0-9/-]{1,16}$/.test(doc?.number || '') || !Number.isSafeInteger(body.totals?.total) || body.totals.total < 0)
    throw new Error('Invalid finalized quote');
  const amountMicros = body.totals.total * 10_000;
  if (!Number.isSafeInteger(amountMicros)) throw new Error('Quote total exceeds supported currency precision');
  const previous = await list(m.quotes, `id[eq]:${session.sessionId}`);
  const existing = previous[0];
  if (!existing) {
    const duplicates = await list(m.quotes, `name[eq]:${doc.number}`);
    if (duplicates.length) throw new Error('Quote number already exists. Choose a different number.');
    await api(`${m.sources}/${session.sourceRecordId}`);
    if (typeof body.pdfBase64 !== 'string' || body.pdfBase64.length > 25_000_000) throw new Error('PDF is missing or too large');
    const pdf = Buffer.from(body.pdfBase64, 'base64');
    if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF');
    const fileName = `${doc.number.replace(/\//g, '-')}.pdf`;
    const upload = await new MetadataApiClient().uploadFile(pdf, fileName, 'application/pdf', QUOTE_PDF_FILE_FIELD_UNIVERSAL_IDENTIFIER);
    const record = {
      id: session.sessionId, name: doc.number, quoteDate: doc.date, validTill: doc.validUntil || null,
      amount: { amountMicros, currencyCode: 'INR' },
      status: 'FINALIZING',
      [m.quoteLead]: session.sourceRecordId, isCurrent: false,
      companyId: session.prefill.sourceCompanyId || null, personId: session.prefill.sourcePersonId || null,
      customerSnapshot: doc.customer, itemsSnapshot: doc.items,
      documentSnapshot: { document: doc, totals: body.totals, sourceCompanyId: session.prefill.sourceCompanyId, sourcePersonId: session.prefill.sourcePersonId, sessionId: session.sessionId, fingerprint },
      pdfFile: [{ fileId: upload.id, label: fileName }],
    };
    try { await api(m.quotes, 'POST', record); }
    catch (error) {
      // A deterministic record ID makes simultaneous/retried callbacks converge.
      if (!(await list(m.quotes, `id[eq]:${session.sessionId}`)).length) throw error;
    }
  } else if (!existing.pdfFile?.length || existing.documentSnapshot?.sessionId !== session.sessionId) {
    throw new Error('An incomplete or conflicting quote needs repair before retrying');
  }
  const persisted = (await list(m.quotes, `id[eq]:${session.sessionId}`))[0];
  if (persisted.documentSnapshot?.fingerprint !== fingerprint) throw new Error('This finalization session is already bound to different quote details');
  const linePlural = 'invoifyQuoteLines';
  if (persisted.status !== 'FINALIZED') {
    for (const [index, item] of doc.items.entries()) {
      const hex = createHash('sha256').update(`${session.sessionId}:${index}`).digest('hex');
      const id = `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
      if (!(await list(linePlural, `id[eq]:${id}`)).length) {
        const total = body.totals.lines[index]?.total;
        if (!Number.isSafeInteger(total)) throw new Error('Invalid line total');
        try { await api(linePlural, 'POST', {
          id, quoteId: session.sessionId, name: item.name, quantity: item.quantity,
          unitPrice: { amountMicros: Math.round(item.price * 1_000_000), currencyCode: 'INR' },
          lineTotal: { amountMicros: total * 10_000, currencyCode: 'INR' },
          snapshot: body.totals.lines[index], sourceProductId: item.sourceProductId || null, sourceServiceId: item.sourceServiceId || null,
        }); } catch (error) { if (!(await list(linePlural, `id[eq]:${id}`)).length) throw error; }
      }
    }
    await api(`${m.quotes}/${session.sessionId}`, 'PATCH', { status: 'FINALIZED', finalizationStatus: 'FINALIZED', finalizedAt: new Date().toISOString() });
  }
  const related = await list(m.quotes, `${m.quoteLead}[eq]:${session.sourceRecordId}`);
  const finalized = related.filter(q => q.status === 'FINALIZED')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b.id.localeCompare(a.id));
  const currentId = finalized[0]?.id;
  for (const q of related) {
    if (q.isCurrent !== (q.id === currentId)) await api(`${m.quotes}/${q.id}`, 'PATCH', { isCurrent: q.id === currentId });
  }
  return { ok: true, quoteId: session.sessionId, returnUrl: session.returnUrl, idempotent: Boolean(existing) };
};

export default defineLogicFunction({
  universalIdentifier: '7f219c0f-ecf1-4bbd-9fb3-3a4fce1a66a7', name: 'finalize-invoify-quote',
  description: 'Accept server-signed finalization, upload the native PDF, and preserve a complete immutable quote snapshot.',
  timeoutSeconds: 60, handler,
  httpRouteTriggerSettings: { path: '/invoify/finalize-quote', httpMethod: 'POST', isAuthRequired: false, forwardedRequestHeaders: ['x-invoify-signature'] },
});
