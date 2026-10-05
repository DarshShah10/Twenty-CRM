const fs=require('node:fs/promises');
const path=require('node:path');
async function configureInstalled() {
  const base=process.env.TWENTY_API_URL;
  const token=process.env.TWENTY_API_KEY;
  if(!base || !token) throw new Error('Set TWENTY_API_URL and TWENTY_API_KEY');
  const graph=async(query,variables={})=>{
    const response=await fetch(base.replace(/\/$/,'')+'/metadata',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query,variables})});
    const result=await response.json();
    if(!response.ok || result.errors) throw new Error(JSON.stringify(result.errors || result));
    return result.data;
  };
  const report=JSON.parse(await fs.readFile(path.resolve(__dirname,'../workspace-report.json'),'utf8'));
  const {findOneApplication:app}=await graph('query($id:UUID!){findOneApplication(universalIdentifier:$id){id defaultRoleId}}',{id:'0214f822-f1a1-404a-943d-a5693183452c'});
  const response=await fetch(base.replace(/\/$/,'')+'/rest/metadata/objects?limit=200',{headers:{Authorization:`Bearer ${token}`}});
  const metadata=await response.json();
  const own=metadata.data.filter(o=>['invoifyQuote','invoifyQuoteLine'].includes(o.nameSingular));
  if(own.length!==2) throw new Error('Install the app-owned quote schema first');
  const variables={
    INVOIFY_BASE_URL:process.env.INVOIFY_PUBLIC_URL,
    INVOIFY_SESSION_SIGNING_SECRET:process.env.INVOIFY_HANDOFF_SECRET,
    INVOIFY_CALLBACK_URL:process.env.TWENTY_CALLBACK_URL,
    TWENTY_PUBLIC_URL:process.env.TWENTY_PUBLIC_URL,
    INVOIFY_SCHEMA_MAPPING:JSON.stringify(report.mapping),
  };
  for(const [key,value] of Object.entries(variables)) {
    if(!value) throw new Error(`Configure ${key} in the installation environment`);
    await graph('mutation($id:UUID!,$key:String!,$value:String!){updateOneApplicationVariable(applicationId:$id,key:$key,value:$value)}',{id:app.id,key,value});
  }
  console.log('Application variables configured. No secrets were printed.');
}
module.exports={configureInstalled};
if(require.main===module) configureInstalled().catch(e=>{console.error(e.message);process.exitCode=1});
