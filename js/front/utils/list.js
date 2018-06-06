// @flow
import type { ListType, ReviewsType, ListConditions } from 'front/types';
import type { ReviewListType, ReviewType } from 'common/types';
import { map, prop } from 'ramda';

const mapReviews = (reviews: Array<number>, allReviews: ReviewsType): Array<ReviewType> => map(id => allReviews[id], reviews);

const getReviewIds = map(prop('id'));

export const getReviewList = (list: ListType, allReviews: ReviewsType): ReviewListType => {
  const { reviews, ...rest } = list;
  return {
    reviews: mapReviews(reviews, allReviews),
    ...rest
  };
};

export const getList = (id: string, conditions: ListConditions, list: ReviewListType): ListType => {
  const { reviews, ...rest } = list;
  return {
    id,
    conditions,
    reviews: getReviewIds(reviews),
    ...rest
  };
};
