import { defineView, ViewKey } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, QUOTE_NAME_FIELD } from 'src/constants/quote-fields';
export default defineView({ universalIdentifier: 'd0f730fe-5bc1-45e9-9f52-3d9b317c4c01', name: 'All Quotes', objectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER, icon: 'IconFileInvoice', key: ViewKey.INDEX, position: 0,
  fields: [
    { universalIdentifier: 'd0f730fe-5bc1-45e9-9f52-3d9b317c4c02', fieldMetadataUniversalIdentifier: QUOTE_NAME_FIELD, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: 'd0f730fe-5bc1-45e9-9f52-3d9b317c4c03', fieldMetadataUniversalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101004', position: 1, isVisible: true, size: 120 },
    { universalIdentifier: 'd0f730fe-5bc1-45e9-9f52-3d9b317c4c04', fieldMetadataUniversalIdentifier: 'a097fc55-f2fb-4b66-93ce-4a0ec2101003', position: 2, isVisible: true, size: 160 },
  ],
});
