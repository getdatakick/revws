// @flow
import type { ReviewType } from 'common/types';
import { reduce, add, values, assoc, map  } from 'ramda';
import { isArray } from 'common/utils/ramda';

export const fixReview = (review: any): ReviewType => {
  let ret = assoc('date', new Date(review.date), review);
  if (isArray(ret.grades)) {
    ret = assoc('grades', {}, ret);
  }
  return ret;
};

export const fixReviews = map(fixReview);

export const averageGrade = (review: ReviewType): number => {
  const vals = values(review.grades);
  const cnt = vals.length;
  if (cnt) {
    const sum = reduce(add, 0, vals);
    return sum / cnt;
  }
  return 0;
};

export const hasRatings = (review: ReviewType) => {
  return values(review.grades).length > 0;
};
