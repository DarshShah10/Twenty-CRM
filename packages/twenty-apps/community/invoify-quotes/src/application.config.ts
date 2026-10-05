import { defineApplication } from 'twenty-sdk/define';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Invoify Quotes', description: 'Prefill, finalize, and store quotes and PDFs from CRM leads.',
  category: 'Sales and finance', author: 'Community',
  applicationVariables: {
    INVOIFY_BASE_URL: { universalIdentifier: 'b0598297-df64-478b-98a3-21eeff0f5201', description: 'Public editor origin, including HTTPS in production.', value: '', isSecret: false },
    INVOIFY_SESSION_SIGNING_SECRET: { universalIdentifier: 'b0598297-df64-478b-98a3-21eeff0f5202', description: 'Shared server-only handoff and callback signing secret (32+ characters).', isSecret: true },
    INVOIFY_CALLBACK_URL: { universalIdentifier: 'b0598297-df64-478b-98a3-21eeff0f5203', description: 'Exact HTTP trigger URL for finalize-invoify-quote, reachable from the editor server.', isSecret: true },
    TWENTY_PUBLIC_URL: { universalIdentifier: 'b0598297-df64-478b-98a3-21eeff0f5204', description: 'Public CRM frontend origin for returning to the lead.', value: '', isSecret: false },
    INVOIFY_SCHEMA_MAPPING: { universalIdentifier: 'b0598297-df64-478b-98a3-21eeff0f5205', description: 'JSON mapping from the workspace setup report.', isSecret: true },
  },
});
