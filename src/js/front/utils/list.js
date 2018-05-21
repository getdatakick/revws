// @flow
import type { ListType, ReviewsType } from 'front/types';
import type { ReviewListType, ReviewType } from 'common/types';
import { map } from 'ramda';

const fixReviews = (reviews: Array<number>, allReviews: ReviewsType): Array<ReviewType> => map(id => allReviews[id], reviews);

export const getReviewList = (list: ListType, allReviews: ReviewsType): ReviewListType => {
  const { reviews, ...rest } = list;
  return {
    reviews: fixReviews(reviews, allReviews),
    ...rest
  };
};
