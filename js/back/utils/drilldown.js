// @flow
import type { DrilldownUrls } from 'back/types.js';
import type { EntityType } from 'common/types.js';

const getUrl = (type: string, urls: DrilldownUrls, id: number) => {
  const url = urls[type];
  if (! url) {
    throw new Error('Invalid url type '+type);
  }
  return decodeURI(url).replace('999', `${id}`);
};

export const editProductUrl = (urls: DrilldownUrls, productId: number): string => getUrl('editProduct', urls, productId);
export const viewCustomerUrl = (urls: DrilldownUrls, customerId: number): string => getUrl('viewCustomer', urls, customerId);
export const editCustomerUrl = (urls: DrilldownUrls, customerId: number): string => getUrl('editCustomer', urls, customerId);
export const viewOrderUrl = (urls: DrilldownUrls, orderId: number): string => getUrl('viewOrder', urls, orderId);

const functions = {
  product: editProductUrl
};

export const editEntityUrl = (urls: DrilldownUrls, entityType: EntityType, entityId: number): ?string => {
  const func = functions[entityType];
  return func ? func(urls, entityId) : null;
};
