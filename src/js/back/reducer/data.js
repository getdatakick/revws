// @flow
import type { Action } from 'back/actions';
import Types from 'back/actions/types';
import { always, map, assoc, update, findIndex, propEq, merge } from 'ramda';

type State = {
  [ string ]: ?any
}

const defaultState = {
};

const updateReviews = (reviewId, func, state) => map(data => {
  if (data.reviews) {
    const index = findIndex(propEq('id', reviewId), data.reviews);
    if (index > -1) {
      const reviews = update(index, func(data.reviews[index]), data.reviews);
      return assoc('reviews', reviews, data);
    }
  }
  return data;
}, state);

const markDeleted = deleted => review => merge(review, {
  deleted,
  underReview: true
});

export default (state?: State, action:Action): State => {
  state = state || defaultState;
  if (action.type === Types.setData) {
    return merge(state, action.payload);
  }
  if (action.type === Types.reviewApproved) {
    return updateReviews(action.id, assoc('underReview', false), state);
  }
  if (action.type === Types.reviewDeleted) {
    return updateReviews(action.id, markDeleted(true), state);
  }
  if (action.type === Types.reviewUndeleted) {
    return updateReviews(action.id, markDeleted(false), state);
  }
  if (action.type === Types.reviewSaved) {
    return updateReviews(action.review.id, always(action.review), state);
  }
  return state;
};
