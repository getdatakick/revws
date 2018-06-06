// @flow
import type { Action } from 'back/actions';
import Types from 'back/actions/types';
import { reject, has, always, map, assoc, update, findIndex, propEq, merge } from 'ramda';

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

const resetReviews = reject(has('reviews'));

export default (state?: State, action:Action): State => {
  state = state || defaultState;
  if (action.type === Types.setData) {
    return merge(state, action.payload);
  }
  if (action.type === Types.reviewUpdated) {
    return updateReviews(action.review.id, always(action.review), state);
  }
  if (action.type === Types.reviewCreated) {
    return resetReviews(state);
  }
  return state;
};
