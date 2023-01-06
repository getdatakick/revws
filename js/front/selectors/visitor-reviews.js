// @flow
import type { State } from 'front/reducer/index.js';
import type { EntityType } from 'common/types.js';
import { includes } from 'ramda';

export const getProductsToReview = (state: State): Array<number> => state.visitorReviews.toReview.product;

export const getIsReviewed = (state: State): ((type: EntityType, id: number) => boolean) => (type: EntityType, id: number): boolean => {
  const list = state.visitorReviews.reviewed[type];
  return includes(id, list);
};
