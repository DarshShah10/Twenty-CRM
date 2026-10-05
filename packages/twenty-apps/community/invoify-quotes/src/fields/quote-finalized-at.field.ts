import { defineField, FieldType } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineField({ universalIdentifier: '820b092f-9451-465a-a9c7-2879d4d72302', objectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, type: FieldType.DATE_TIME, name: 'finalizedAt', label: 'Finalized at', icon: 'IconCalendarCheck' });
