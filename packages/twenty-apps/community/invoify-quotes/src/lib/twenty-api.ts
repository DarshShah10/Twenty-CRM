export type RecordData = Record<string, any>;

export async function api(path: string, method = 'GET', data?: unknown): Promise<RecordData> {
  const base = process.env.TWENTY_API_URL;
  const token = process.env.TWENTY_APP_ACCESS_TOKEN;
  if (!base || !token) throw new Error('Twenty app runtime authentication is unavailable');
  const response = await fetch(`${base.replace(/\/$/, '')}/rest/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json();
  if (!response.ok || result.errors) throw new Error(`Twenty ${method} ${path.split('?')[0]} failed: ${JSON.stringify(result)}`);
  return result.data;
}

export async function list(plural: string, filter?: string): Promise<RecordData[]> {
  const records: RecordData[] = [];
  let after: string | undefined;
  do {
    const params = new URLSearchParams({ limit: '60' });
    if (filter) params.set('filter', filter);
    if (after) params.set('starting_after', after);
    const base = process.env.TWENTY_API_URL;
    const response = await fetch(`${base?.replace(/\/$/, '')}/rest/${plural}?${params}`, {
      headers: { Authorization: `Bearer ${process.env.TWENTY_APP_ACCESS_TOKEN}` },
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`Could not load ${plural}: ${JSON.stringify(result)}`);
    records.push(...result.data[plural]);
    after = result.pageInfo?.hasNextPage ? result.pageInfo.endCursor : undefined;
    if (records.length > 500) throw new Error('This lead has too many related records for one quote');
  } while (after);
  return records;
}

export function schemaMapping() {
  const raw = process.env.INVOIFY_SCHEMA_MAPPING;
  if (!raw) throw new Error('Configure INVOIFY_SCHEMA_MAPPING using the workspace setup report');
  return JSON.parse(raw) as {
    source: string; sources: string; quotes: string; quote: string;
    products: string; product: string; leadProducts: string;
    services: string; service: string; companies: string; company: string;
    people: string; person: string; sourceCompany: string; sourcePerson: string;
    sourceService: string; joinLead: string; joinProduct: string; quoteLead: string;
  };
}
