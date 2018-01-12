// @flow
import type { Action } from 'front/actions';
import type { ReviewListType, ReviewType } from 'common/types';
import { assoc, findIndex, propEq, append, update, reject } from 'ramda';
import Types from 'front/actions/types';

type State = {
  reviews: ReviewListType
}

const defaultState = (reviews: ReviewListType): State => ({
  reviews
});

const deleteReview = (id: number, reviews: ReviewListType): ReviewListType => {
  return reject(propEq('id', id), reviews);
};

const markVoted = (id: number, reviews: ReviewListType): ReviewListType => {
  const index = findIndex(propEq('id', id), reviews);
  if (index > -1) {
    const review = assoc('canVote', false, reviews[index]);
    return update(index, review, reviews);
  }
  return reviews;
};

const markReported = (id: number, reviews: ReviewListType): ReviewListType => {
  const index = findIndex(propEq('id', id), reviews);
  if (index > -1) {
    const review = assoc('canReport', false, reviews[index]);
    return update(index, review, reviews);
  }
  return reviews;
};

const setReview = (review: ReviewType, reviews: ReviewListType): ReviewListType => {
  const index = findIndex(propEq('id', review.id), reviews);
  if (index == -1) {
    return append(review, reviews);
  } else {
    return update(index, review, reviews);
  }
};

export default (initialReviews: ReviewListType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState(initialReviews);

    if (action.type === Types.setReview) {
      return {...state, reviews: setReview(action.review, state.reviews) };
    }

    if (action.type === Types.deleteReview) {
      return {...state, reviews: deleteReview(action.id, state.reviews) };
    }

    if (action.type === Types.triggerVote) {
      return {...state, reviews: markVoted(action.review.id, state.reviews) };
    }

    if (action.type === Types.triggerReportReview) {
      return {...state, reviews: markReported(action.review.id, state.reviews) };
    }

    return state;
  };
};
