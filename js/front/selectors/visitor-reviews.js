// @flow
import type { State } from 'front/reducer';
import type { EntityType } from 'common/types';
import { contains } from 'ramda';

export const getProductsToReview = (state: State) => state.visitorReviews.PRODUCT.toReview;

export const getIsReviewed = (state: State) => (type: EntityType, id: number): boolean => {
  const list = state.visitorReviews[type];
  return contains(id, list);
};
