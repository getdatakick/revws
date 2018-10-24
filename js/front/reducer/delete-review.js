// @flow
import type { Action } from 'front/actions';
import Types from 'front/actions/types';
import type { ReviewType } from 'common/types';

export type State = {
  review: ?ReviewType
}

const defaultState: State = {
  review: null
};

const setReview = (review: ?ReviewType) => ({ review });

export default (state?: State, action:Action): State => {
  state = state || defaultState;

  if (action.type === Types.triggerDeleteReview) {
    return setReview(action.review);
  }

  if (action.type === Types.closeDeleteReview) {
    return setReview(null);
  }

  if (action.type === Types.deleteReview) {
    return setReview(null);
  }

  return state;
};
