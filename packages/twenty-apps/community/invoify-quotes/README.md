# Invoify Quotes community app

This Twenty app provides the native Create Quote action, signed editor sessions, app-owned Quotes and Quote Line Items, Lead/client relations and native PDF storage.

Use Node 24 and the pinned Twenty 2.5 SDK. Export TWENTY_API_URL, TWENTY_API_KEY, TWENTY_PUBLIC_URL, INVOIFY_PUBLIC_URL, TWENTY_CALLBACK_URL and INVOIFY_HANDOFF_SECRET, then run corepack yarn install and yarn install:workspace on Linux. Workspace bindings are discovered by configure-workspace.cjs; credentials are kept in memory by run-cli.cjs.

When deploying from Windows to Linux, run yarn configure, yarn sync:linux, then node scripts/configure-installed.cjs. The API URL must be reachable from the Linux container. Building on Linux avoids backslash paths produced by the upstream Windows CLI.

See the editor repository DEPLOYMENT.md for the complete audit, schema contract, Linux container setup, permissions and acceptance-test instructions. The standard opportunity object is the Lead source. Existing legacy quote data is preserved.

Editor source: [DarshShah10/Invoify-](https://github.com/DarshShah10/Invoify-). Detailed server steps: [SERVER_INSTALLATION_REALFILMS.md](https://github.com/DarshShah10/Invoify-/blob/main/SERVER_INSTALLATION_REALFILMS.md). Keep API keys and company configuration outside Git; regenerate workspace bindings during installation.

Checks: yarn typecheck and yarn test.

Official architecture references:
- https://github.com/twentyhq/twenty/tree/main/packages/twenty-docs/developers/extend/apps
- https://github.com/twentyhq/twenty/tree/main/packages/twenty-sdk

This app reads workspace records because Twenty 2.5 cannot reference catalog objects owned by the Custom application in role manifest permissions. It writes only app-owned quote tables and has upload/download file permissions; it does not patch Twenty core.
