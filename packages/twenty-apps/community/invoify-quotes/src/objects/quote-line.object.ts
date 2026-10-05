import { defineObject, FieldType } from 'twenty-sdk/define';
import { LINE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineObject({
  universalIdentifier: LINE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'invoifyQuoteLine', namePlural: 'invoifyQuoteLines', labelSingular: 'Quote Line Item', labelPlural: 'Quote Line Items', icon: 'IconListNumbers',
  fields: [
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102001', name: 'quantity', label: 'Quantity', type: FieldType.NUMBER },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102002', name: 'unitPrice', label: 'Unit price', type: FieldType.CURRENCY },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102003', name: 'lineTotal', label: 'Line total', type: FieldType.CURRENCY },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102004', name: 'snapshot', label: 'Product and tax snapshot', type: FieldType.RAW_JSON },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102005', name: 'sourceProductId', label: 'Source product ID', type: FieldType.UUID },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2102006', name: 'sourceServiceId', label: 'Source service ID', type: FieldType.UUID },
  ],
});
