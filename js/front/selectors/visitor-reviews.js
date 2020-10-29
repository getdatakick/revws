// @flow
import type { State } from 'front/reducer';
import type { EntityType } from 'common/types';
import { contains } from 'ramda';

export const getProductsToReview = (state: State): Array<number> => state.visitorReviews.toReview.product;

export const getIsReviewed = (state: State): ((type: EntityType, id: number) => boolean) => (type: EntityType, id: number): boolean => {
  const list = state.visitorReviews.reviewed[type];
  return contains(id, list);
};
