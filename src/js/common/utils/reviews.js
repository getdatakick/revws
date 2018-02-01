// @flow
import type { ReviewType } from 'common/types';
import { reduce, add, values, assoc, map  } from 'ramda';
import { isArray } from 'common/utils/ramda';

const getDate = (str: string): Date => {
  var date = new Date(str);
  if (isNaN(date.getTime())) {
    const t = str.split(/[- :]/);
    return new Date(parseInt(t[0], 10), parseInt(t[1], 10)-1, parseInt(t[2], 10), parseInt(t[3], 10), parseInt(t[4], 10), parseInt(t[5], 10));
  }
  return date;
};

export const fixReview = (review: any): ReviewType => {
  let ret = assoc('date', getDate(review.date), review);
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
