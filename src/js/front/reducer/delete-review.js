// @flow
import type { Action } from 'front/actions';
import Types from 'front/actions/types';

type State = {
  reviewId: ?number
}

const defaultState: State = {
  reviewId: null
};

const setReviewId = (reviewId: ?number) => ({ reviewId });

export default (state?: State, action:Action): State => {
  state = state || defaultState;

  if (action.type === Types.triggerDeleteReview) {
    return setReviewId(action.review.id);
  }

  if (action.type === Types.closeDeleteReview) {
    return setReviewId(null);
  }

  if (action.type === Types.deleteReview) {
    return setReviewId(null);
  }

  return state;
};
