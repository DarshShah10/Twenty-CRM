import { defineField, FieldType } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineField({ universalIdentifier: '820b092f-9451-465a-a9c7-2879d4d72303', objectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, type: FieldType.SELECT, name: 'finalizationStatus', label: 'Document status', icon: 'IconCircleCheck', options: [{ id: '820b092f-9451-465a-a9c7-2879d4d72304', value: 'FINALIZED', label: 'Finalized', color: 'green', position: 0 }] });
