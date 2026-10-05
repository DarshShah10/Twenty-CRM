import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/quote-fields';
export default defineNavigationMenuItem({ universalIdentifier: 'd0f730fe-5bc1-45e9-9f52-3d9b317c4a01', name: 'Quotes', icon: 'IconFileInvoice', color: 'blue', position: 1, type: NavigationMenuItemType.OBJECT, targetObjectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER });
