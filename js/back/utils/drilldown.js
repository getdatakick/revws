// @flow
import type { DrilldownUrls } from 'back/types';

const getUrl = (type: string, urls: DrilldownUrls, id: number) => {
  const url = urls[type];
  if (! url) {
    throw new Error('Invalid url type '+type);
  }
  return decodeURI(url).replace('{ID}', `${id}`);
};

export const editProductUrl = (urls: DrilldownUrls, productId: number) => getUrl('editProduct', urls, productId);
export const viewCustomerUrl = (urls: DrilldownUrls, customerId: number) => getUrl('viewCustomer', urls, customerId);
export const editCustomerUrl = (urls: DrilldownUrls, customerId: number) => getUrl('editCustomer', urls, customerId);
export const viewOrderUrl = (urls: DrilldownUrls, orderId: number) => getUrl('viewOrder', urls, orderId);
