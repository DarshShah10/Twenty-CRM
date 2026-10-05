# Invoify Quotes extension

This repository retains Twenty's upstream source/history and license. The quote feature is a community application under [packages/twenty-apps/community/invoify-quotes](packages/twenty-apps/community/invoify-quotes), with no quote-related core patch. Its SDK/client dependencies are pinned to 2.5.0 and its workflow was tested against Twenty 2.5.1.

The companion editor/PDF server is [DarshShah10/Invoify-](https://github.com/DarshShah10/Invoify-). Both components are required for Lead → prefilled quote → editing → finalized PDF → saved quote/Lead relationship.

Follow the editor's [server installation guide](https://github.com/DarshShah10/Invoify-/blob/main/SERVER_INSTALLATION_REALFILMS.md) for transfer, ARM64 deployment, HTTPS, app installation, verification and backups. The guide includes a read-only inventory of the existing server. No production deployment was performed while creating it.

For an already-running Twenty instance, install this application through the supported SDK/API. Do not replace its running CRM image with this checkout merely to add quoting. Keep existing CRM data and legacy quote records until deliberately reviewed.

Private environment files, API keys, business configuration, session storage, generated workspace bindings and SDK build output are excluded. Generate bindings against the target workspace using the app's installer. Local development helpers relying on a private copied database/runtime are also excluded.

See the [app README](packages/twenty-apps/community/invoify-quotes/README.md) for installation commands, permissions and version constraints.
