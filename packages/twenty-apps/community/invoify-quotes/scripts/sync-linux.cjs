const { spawn } = require('node:child_process');
const path = require('node:path');
const appRoot = path.resolve(__dirname, '..');
if (!process.env.TWENTY_API_URL || !process.env.TWENTY_API_KEY) throw new Error('Set TWENTY_API_URL and TWENTY_API_KEY');
const args = ['run','--rm','--init',
  ...(process.env.TWENTY_DOWNLOAD_NETWORK ? ['--network', process.env.TWENTY_DOWNLOAD_NETWORK] : []),
  '--mount',`type=bind,source=${appRoot},target=/app`,
  '--mount','type=volume,target=/app/node_modules',
  '--mount','type=volume,target=/root/.yarn/berry',
  '-w','/app','-e','TWENTY_API_URL','-e','TWENTY_API_KEY',
  process.env.TWENTY_DEPLOY_IMAGE || 'node:24-bookworm',
  'sh','-c','corepack yarn install && node scripts/run-cli.cjs dev --once',
];
const child=spawn('docker',args,{stdio:'inherit',env:process.env,windowsHide:true});
child.on('exit',code=>{process.exitCode=code || 0});
