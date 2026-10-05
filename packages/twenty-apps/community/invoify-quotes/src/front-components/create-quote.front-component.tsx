import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { getApplicationVariable, useSelectedRecordIds } from 'twenty-sdk/front-component';
import { CREATE_QUOTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const CreateQuote = () => {
  const recordIds = useSelectedRecordIds();
  const [recordId] = recordIds;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [launchUrl, setLaunchUrl] = useState('');
  const launch = async () => {
    setBusy(true); setError('');
    try {
      if (recordIds.length !== 1 || !recordId) throw new Error('Select exactly one lead');
      const editor = getApplicationVariable('INVOIFY_BASE_URL');
      if (!editor) throw new Error('Configure INVOIFY_BASE_URL');
      const response = await fetch(`${process.env.TWENTY_API_URL?.replace(/\/$/, '')}/s/invoify/quote-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TWENTY_APP_ACCESS_TOKEN}` },
        body: JSON.stringify({ opportunityId: recordId }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Could not load lead details');
      const exchanged = await fetch(`${editor.replace(/\/$/, '')}/api/quote/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.exchangeToken }),
      });
      const session = await exchanged.json();
      if (!exchanged.ok) throw new Error(session.error || 'Could not open editor session');
      setLaunchUrl(session.launchUrl);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create quote'); }
    finally { setBusy(false); }
  };
  return <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <strong>Create Quote</strong>
    <p>Client and linked products are loaded from this lead. Edit and finalize them in the quote editor.</p>
    {error && <p style={{ color: '#b42318' }}>{error}</p>}
    {launchUrl ? <a href={launchUrl} target="_blank" rel="noopener noreferrer">Open prefilled quote editor</a>
      : <button disabled={busy} onClick={() => void launch()}>{busy ? 'Loading lead…' : 'Create Quote'}</button>}
  </div>;
};
export default defineFrontComponent({
  universalIdentifier: CREATE_QUOTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'create-quote', description: 'Start a secure quote editing session from a lead.', component: CreateQuote,
});
