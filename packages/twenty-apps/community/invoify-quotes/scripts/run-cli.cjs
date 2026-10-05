// Keep deployment credentials in process memory. Nothing is written to ~/.twenty.
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
if (!process.env.TWENTY_API_URL || !process.env.TWENTY_API_KEY) throw new Error('Set TWENTY_API_URL and TWENTY_API_KEY');
const configPath = path.join(os.homedir(), '.twenty', 'config.json');
let config = JSON.stringify({version:1,defaultRemote:'deployment',remotes:{deployment:{apiUrl:process.env.TWENTY_API_URL,apiKey:process.env.TWENTY_API_KEY}}});
for (const name of ['readFile','writeFile','access']) {
  const original=fs[name];
  fs[name]=async function(file,...args) {
    if(path.resolve(String(file))===configPath) {
      if(name==='readFile') return config;
      if(name==='writeFile') config=String(args[0]);
      return;
    }
    return original.call(this,file,...args);
  };
}
const cli=path.resolve(__dirname,'../node_modules/twenty-sdk/dist/cli.cjs');
process.argv=[process.execPath,cli,...process.argv.slice(2)];
require(cli);
