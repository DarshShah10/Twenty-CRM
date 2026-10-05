import { describe, expect, it } from 'vitest';
import { mapItem } from './create-invoify-session-route';

describe('catalog item prefill', () => {
  it('converts Twenty currency micros and preserves source and warranty details', () => {
    expect(mapItem({ id: 'product-id', name: 'Projector', price: { amountMicros: 123456789, currencyCode: 'INR' }, quoteDescription: { markdown: 'Description' }, warrantyPeriod: '2 years', warrantyTerms: { markdown: 'Parts only' } }, 'goods', 'join-id')).toMatchObject({ id: 'join-id', sourceProductId: 'product-id', price: 123.456789, quantity: 1, gstRate: null, hsn: '', description: 'Description', warranty: '2 years\nParts only' });
  });
  it('rejects unsupported currency rather than silently treating it as INR', () => {
    expect(() => mapItem({ name: 'Foreign price', price: { amountMicros: 1000000, currencyCode: 'USD' } }, 'goods', 'id')).toThrow('requires INR');
  });
  it('preserves service provenance and supplies the service unit default', () => {
    expect(mapItem({ id: 'service-id', name: 'Installation' }, 'service', 'line-id')).toMatchObject({ sourceServiceId: 'service-id', kind: 'service', unit: 'job', price: 0 });
  });
});
