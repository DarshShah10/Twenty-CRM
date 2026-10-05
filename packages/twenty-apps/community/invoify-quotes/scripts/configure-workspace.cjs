const fs = require('node:fs/promises');
const path = require('node:path');
async function configure() {
  const base = process.env.TWENTY_API_URL;
  const token = process.env.TWENTY_API_KEY;
  if (!base || !token) throw new Error('Set TWENTY_API_URL and TWENTY_API_KEY for the target workspace');
  const names = {
    source: process.env.TWENTY_SOURCE_OBJECT || 'opportunity',
    product: process.env.TWENTY_PRODUCT_OBJECT || 'product', service: process.env.TWENTY_SERVICE_OBJECT || 'service',
    join: process.env.TWENTY_LEAD_PRODUCT_OBJECT || 'leadProduct', company: 'company', person: 'person',
  };
  if (names.source !== 'opportunity') throw new Error('This app version uses the standard opportunity (Lead) object for native relations');
  const response = await fetch(base.replace(/\/$/,'')+'/rest/metadata/objects?limit=200',{headers:{Authorization:`Bearer ${token}`}});
  const result = await response.json();
  if (!response.ok) throw new Error('Cannot read metadata: '+JSON.stringify(result));
  const objects = result.data;
  const selected = Object.fromEntries(Object.entries(names).map(([alias,name])=>{
    const object=objects.find(o=>o.nameSingular===name && o.isActive);
    if(!object) throw new Error(`Missing active ${name} object; configure TWENTY_${alias.toUpperCase()}_OBJECT`);
    return [alias,object];
  }));
  function field(object,name,type) {
    const item=object.fields.find(f=>f.name===name && f.isActive);
    if(!item || (type && item.type!==type)) throw new Error(`${object.nameSingular}.${name} must exist as ${type || 'a field'}`);
    return item.universalIdentifier;
  }
  const mapping = {
    source:selected.source.nameSingular, sources:selected.source.namePlural, quote:'invoifyQuote', quotes:'invoifyQuotes',
    product:selected.product.nameSingular, products:selected.product.namePlural, service:selected.service.nameSingular, services:selected.service.namePlural,
    leadProducts:selected.join.namePlural, company:selected.company.nameSingular, companies:selected.company.namePlural,
    person:selected.person.nameSingular, people:selected.person.namePlural,
    sourceCompany:process.env.TWENTY_SOURCE_COMPANY_FIELD || 'companyId', sourcePerson:process.env.TWENTY_SOURCE_PERSON_FIELD || 'pointOfContactId',
    sourceService:process.env.TWENTY_SOURCE_SERVICE_FIELD || 'serviceId', joinLead:process.env.TWENTY_JOIN_LEAD_FIELD || 'leadId', joinProduct:process.env.TWENTY_JOIN_PRODUCT_FIELD || 'productId', quoteLead:process.env.TWENTY_QUOTE_LEAD_FIELD || 'leadId',
  };
  field(selected.source,mapping.sourceCompany.replace(/Id$/,''),'RELATION');
  field(selected.join,mapping.joinLead.replace(/Id$/,''),'RELATION');
  field(selected.join,mapping.joinProduct.replace(/Id$/,''),'RELATION');
  field(selected.product,'price','CURRENCY');
  field(selected.product,'name','TEXT');
  const permissions=Object.values(selected).map(o=>({objectMetadataId:o.id,canReadObjectRecords:true,canUpdateObjectRecords:false,canSoftDeleteObjectRecords:false,canDestroyObjectRecords:false}));
  const appRoot=path.resolve(__dirname,'..');
  await fs.mkdir(path.join(appRoot,'src/generated'),{recursive:true});
  const constants={SOURCE_OBJECT_UNIVERSAL_IDENTIFIER:selected.source.universalIdentifier};
  const generated=Object.entries(constants).map(([name,value])=>`export const ${name} = ${JSON.stringify(value)};`).join('\n')+`\nexport const WORKSPACE_OBJECT_PERMISSIONS = ${JSON.stringify(permissions,null,2)};\n`;
  await fs.writeFile(path.join(appRoot,'src/generated/workspace.ts'),generated);
  await fs.writeFile(path.join(appRoot,'workspace-report.json'),JSON.stringify({mapping,permissions,objects:Object.fromEntries(Object.entries(selected).map(([alias,o])=>[alias,{name:o.nameSingular,universalIdentifier:o.universalIdentifier}]))},null,2));
  console.log('Workspace bindings generated. Set INVOIFY_SCHEMA_MAPPING to the mapping in workspace-report.json. No credentials were written.');
  return mapping;
}
module.exports={configure};
if(require.main===module) configure().catch(e=>{console.error(e.message);process.exitCode=1});
