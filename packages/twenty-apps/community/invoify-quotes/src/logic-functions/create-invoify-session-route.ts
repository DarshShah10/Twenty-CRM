import { createHmac, randomUUID } from 'node:crypto';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { CREATE_INVOIFY_SESSION_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { api, list, schemaMapping, type RecordData } from 'src/lib/twenty-api';

export function mapItem(record: RecordData, kind: 'goods' | 'service', id: string) {
  if (record.price?.currencyCode && record.price.currencyCode !== 'INR')
    throw new Error(`Product ${record.name} is priced in ${record.price.currencyCode}; this GST editor requires INR`);
  return {
    id, sourceProductId: kind === 'goods' ? record.id : undefined,
    sourceServiceId: kind === 'service' ? record.id : undefined,
    name: record.name || '', description: record.quoteDescription?.markdown || '',
    section: '', warranty: [record.warrantyPeriod, record.warrantyTerms?.markdown].filter(Boolean).join('\n'),
    hsn: '', kind, quantity: 1, unit: record.unit || (kind === 'service' ? 'job' : 'Nos'),
    price: Number(record.price?.amountMicros || 0) / 1_000_000,
    priceMode: 'exclusive', discount: 0, discountType: 'percentage',
    treatment: 'taxable', gstRate: null,
  };
}

export const handler = async (event: RoutePayload) => {
  const { opportunityId } = (event.body ?? {}) as { opportunityId?: string };
  if (!opportunityId || !/^[0-9a-f-]{36}$/i.test(opportunityId)) throw new Error('Select a valid lead');
  const m = schemaMapping();
  const source = (await api(`${m.sources}/${opportunityId}`))[m.source];
  if (!source) throw new Error('Lead not found or inaccessible');
  const [companyData, personData, joins] = await Promise.all([
    source[m.sourceCompany] ? api(`${m.companies}/${source[m.sourceCompany]}`) : null,
    source[m.sourcePerson] ? api(`${m.people}/${source[m.sourcePerson]}`) : null,
    list(m.leadProducts, `${m.joinLead}[eq]:${opportunityId}`),
  ]);
  const company = companyData?.[m.company];
  const person = personData?.[m.person];
  const address = company?.address || {};
  const gstin = company?.gstNumber || '';
  const stateValue = company?.state || address.addressState || '';
  const state = gstin.slice(0, 2) || (/^\d{2}$/.test(stateValue) ? stateValue : '');
  const items = await Promise.all(joins.map(async join => {
    if (!join[m.joinProduct]) throw new Error('A lead product has no linked product');
    const product = (await api(`${m.products}/${join[m.joinProduct]}`))[m.product];
    if (!product) throw new Error('A linked product is missing or inaccessible');
    return mapItem(product, 'goods', join.id);
  }));
  if (source[m.sourceService]) {
    const service = (await api(`${m.services}/${source[m.sourceService]}`))[m.service];
    if (service) items.push(mapItem(service, 'service', randomUUID()));
  }
  const secret = process.env.INVOIFY_SESSION_SIGNING_SECRET;
  const publicUrl = process.env.TWENTY_PUBLIC_URL;
  const callbackUrl = process.env.INVOIFY_CALLBACK_URL;
  if (!secret || secret.length < 32 || !publicUrl || !callbackUrl) throw new Error('Configure app URLs and signing secret');
  const claims = JSON.parse(Buffer.from(process.env.TWENTY_APP_ACCESS_TOKEN!.split('.')[1], 'base64url').toString());
  const session = {
    version: 2, sessionId: randomUUID(), workspaceId: claims.workspaceId,
    principalId: event.userWorkspaceId || claims.sub, sourceRecordId: opportunityId, sourceObject: m.source,
    callbackUrl, returnUrl: `${publicUrl.replace(/\/$/, '')}/object/${m.source}/${opportunityId}`,
    expiresAt: Date.now() + 60 * 60 * 1000,
    prefill: {
      customer: {
        name: company?.businessName || company?.name || [person?.name?.firstName, person?.name?.lastName].filter(Boolean).join(' ') || source.name,
        address: [address.addressStreet1, address.addressStreet2, address.addressCity || company?.city, stateValue, address.addressCountry].filter(Boolean).join(', '),
        pin: address.addressPostcode || '', state, gstin,
        email: person?.emails?.primaryEmail || company?.email?.primaryEmail || '',
        phone: person?.phones?.primaryPhoneNumber || company?.phone?.primaryPhoneNumber || '',
      },
      items, reference: source.name || '', notes: source.requirement?.markdown || '',
      sourceCompanyId: source[m.sourceCompany], sourcePersonId: source[m.sourcePerson],
    },
  };
  const body = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return { ok: true, exchangeToken: `${body}.${signature}`, sessionId: session.sessionId };
};

export default defineLogicFunction({
  universalIdentifier: CREATE_INVOIFY_SESSION_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'create-invoify-session', description: 'Read client and products under the triggering user permissions and issue a signed handoff.',
  timeoutSeconds: 30, handler,
  httpRouteTriggerSettings: { path: '/invoify/quote-session', httpMethod: 'POST', isAuthRequired: true },
});
