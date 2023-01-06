// @flow
import type { Action } from 'back/actions/index.js';
import Types from 'back/actions/types.js';
import { reject, has, always, map, assoc, update, findIndex, propEq, mergeRight } from 'ramda';
import type {ReviewType} from "common/types";

export type State = {
  [ string ]: ?any
}

const defaultState = {
};

const updateReviews = (reviewId: number, func: (ReviewType)=>any, state: State) => map(data => {
  if (data.reviews) {
    const index = findIndex(propEq('id', reviewId), data.reviews);
    if (index > -1) {
      const reviews = update(index, func(data.reviews[index]), data.reviews);
      return assoc('reviews', reviews, data);
    }
  }
  return data;
}, state);

const deleteReview = (reviewId: number, state: State) => map(data => {
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
    return mergeRight(state, action.payload);
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
