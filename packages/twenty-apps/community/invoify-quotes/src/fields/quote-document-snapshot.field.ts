import { defineField, FieldType } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineField({ universalIdentifier: '820b092f-9451-465a-a9c7-2879d4d72301', objectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, type: FieldType.RAW_JSON, name: 'documentSnapshot', label: 'Final document snapshot', description: 'Immutable full document, company details, terms, source relations and calculated totals.', icon: 'IconFileText' });
