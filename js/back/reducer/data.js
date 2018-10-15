// @flow
import type { Action } from 'back/actions';
import Types from 'back/actions/types';
import { reject, has, always, map, assoc, update, findIndex, propEq, merge } from 'ramda';

export type State = {
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

const deleteReview = (reviewId, state) => map(data => {
  if (data.reviews) {
    const index = findIndex(propEq('id', reviewId), data.reviews);
    if (index > -1) {
      return {
        ...data,
        reviews: reject(propEq('id', reviewId), data.reviews),
        total: data.total - 1
      };
    }
  }
  return data;
}, state);

const resetReviews = reject(has('reviews'));

export default (state?: State, action:Action): State => {
  state = state || defaultState;
  if (action.type === Types.refreshData) {
    return defaultState;
  }
  if (action.type === Types.setCriteria) {
    return defaultState;
  }
  if (action.type === Types.setData) {
    return merge(state, action.payload);
  }
  if (action.type === Types.reviewUpdated) {
    return updateReviews(action.review.id, always(action.review), state);
  }
  if (action.type === Types.reviewCreated) {
    return resetReviews(state);
  }
  if (action.type === Types.reviewDeleted) {
    return deleteReview(action.id, state);
  }
  return state;
};
