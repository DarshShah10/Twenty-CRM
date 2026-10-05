import { defineApplicationRole, PermissionFlag, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, LINE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER, label: 'Invoify Quotes role',
  description: 'Read workspace catalog and client/lead records; write only app-owned quotations and quote lines. Triggered reads are additionally restricted to the current user.',
  canReadAllObjectRecords: true, canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false, canDestroyAllObjectRecords: false, canUpdateAllSettings: false,
  canBeAssignedToAgents: false, canBeAssignedToUsers: false, canBeAssignedToApiKeys: false,
  objectPermissions: [
    ...[STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier].map(objectUniversalIdentifier => ({ objectUniversalIdentifier, canReadObjectRecords: true, canUpdateObjectRecords: false, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false })),
    ...[QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, LINE_OBJECT_UNIVERSAL_IDENTIFIER].map(objectUniversalIdentifier => ({ objectUniversalIdentifier, canReadObjectRecords: true, canUpdateObjectRecords: true, canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false })),
  ], fieldPermissions: [], permissionFlags: [PermissionFlag.UPLOAD_FILE, PermissionFlag.DOWNLOAD_FILE],
});
