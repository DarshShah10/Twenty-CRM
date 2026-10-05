import { defineCommandMenuItem } from 'twenty-sdk/define';
import { SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/generated/workspace';
import {
  CREATE_QUOTE_COMMAND_UNIVERSAL_IDENTIFIER,
  CREATE_QUOTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: CREATE_QUOTE_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Create Quote',
  shortLabel: 'Quote',
  icon: 'IconFileInvoice',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    CREATE_QUOTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
