// @flow
import type { Action } from 'front/actions';
import type { ReviewListType, ReviewType } from 'common/types';
import { merge, assoc, findIndex, propEq, append, update, reject } from 'ramda';
import Types from 'front/actions/types';

type State = {
  loading: boolean,
  list: ReviewListType
};

type Modifier = (Array<ReviewType>) => Array<ReviewType>;

const defaultState = (list: ReviewListType): State => ({
  loading: false,
  list
});

const deleteReview = (id: number) => (reviews: Array<ReviewType>): Array<ReviewType> => {
  return reject(propEq('id', id), reviews);
};

const markVoted = (id: number) => (reviews: Array<ReviewType>): Array<ReviewType> => {
  const index = findIndex(propEq('id', id), reviews);
  if (index > -1) {
    const review = assoc('canVote', false, reviews[index]);
    return update(index, review, reviews);
  }
  return reviews;
};

const markReported = (id: number) => (reviews: Array<ReviewType>): Array<ReviewType> => {
  const index = findIndex(propEq('id', id), reviews);
  if (index > -1) {
    const review = assoc('canReport', false, reviews[index]);
    return update(index, review, reviews);
  }
  return reviews;
};

const setReview = (review: ReviewType) => (reviews: Array<ReviewType>): Array<ReviewType> => {
  const index = findIndex(propEq('id', review.id), reviews);
  if (index == -1) {
    return append(review, reviews);
  } else {
    return update(index, review, reviews);
  }
};

const updateReviews = (func: Modifier, list: ReviewListType): ReviewListType => {
  const len = list.reviews.length;
  const reviews = func(list.reviews);
  const newLen = reviews.length;
  const diff = newLen - len;
  return merge(list, {
    reviews,
    total: list.total + diff
  });
};

export default (initialReviews: ReviewListType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState(initialReviews);

    const { loading, list } = state;

    if (action.type === Types.setReviews) {
      return {loading: false, list: action.reviews };
    }

    if (action.type === Types.loadPage) {
      return {loading: true, list };
    }

    if (action.type === Types.setReview) {
      return {loading, list: updateReviews(setReview(action.review), list) };
    }

    if (action.type === Types.deleteReview) {
      return {loading, list: updateReviews(deleteReview(action.id), list) };
    }

    if (action.type === Types.reviewRemoved) {
      return {loading, list: updateReviews(deleteReview(action.id), list) };
    }

    if (action.type === Types.triggerVote) {
      return {loading, list: updateReviews(markVoted(action.review.id), list) };
    }

    if (action.type === Types.triggerReportReview) {
      return {loading, list: updateReviews(markReported(action.review.id), list) };
    }

    return state;
  };
};
