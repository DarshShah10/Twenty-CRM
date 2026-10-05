import { defineObject, FieldType } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, QUOTE_NAME_FIELD, QUOTE_CURRENT_FIELD_UNIVERSAL_IDENTIFIER, QUOTE_CUSTOMER_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER, QUOTE_ITEMS_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineObject({
  universalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'invoifyQuote', namePlural: 'invoifyQuotes', labelSingular: 'Quote', labelPlural: 'Quotes',
  description: 'Final quotations created from CRM leads.', icon: 'IconFileInvoice',
  labelIdentifierFieldMetadataUniversalIdentifier: QUOTE_NAME_FIELD,
  fields: [
    { universalIdentifier: QUOTE_NAME_FIELD, name: 'name', label: 'Quote number', type: FieldType.TEXT, isUnique: true },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101001', name: 'quoteDate', label: 'Quote date', type: FieldType.DATE },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101002', name: 'validTill', label: 'Valid until', type: FieldType.DATE },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101003', name: 'amount', label: 'Total', type: FieldType.CURRENCY },
    { universalIdentifier: QUOTE_CURRENT_FIELD_UNIVERSAL_IDENTIFIER, name: 'isCurrent', label: 'Current quote', type: FieldType.BOOLEAN, defaultValue: false },
    { universalIdentifier: QUOTE_CUSTOMER_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER, name: 'customerSnapshot', label: 'Customer snapshot', type: FieldType.RAW_JSON },
    { universalIdentifier: QUOTE_ITEMS_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER, name: 'itemsSnapshot', label: 'Items snapshot', type: FieldType.RAW_JSON },
    { universalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101004', name: 'status', label: 'Status', type: FieldType.SELECT, options: [
      { id: 'a097fc55-f2fb-4b66-93ce-4a0ec2101005', value: 'FINALIZING', label: 'Finalizing', color: 'orange', position: 0 },
      { id: 'a097fc55-f2fb-4b66-93ce-4a0ec2101006', value: 'FINALIZED', label: 'Finalized', color: 'green', position: 1 },
      { id: 'a097fc55-f2fb-4b66-93ce-4a0ec2101007', value: 'CANCELLED', label: 'Cancelled', color: 'gray', position: 2 },
    ] },
  ],
});
