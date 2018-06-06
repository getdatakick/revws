// @flow

import type { EntitiesType } from 'front/types';
import type { ProductInfoType } from 'common/types';

export const getProduct = (entities: EntitiesType, productId: number): ProductInfoType => {
  const products = entities.products || {};
  return products[productId];
};
