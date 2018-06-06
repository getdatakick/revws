// @flow

import type { Action } from 'front/actions';
import type { ReviewsType } from 'front/types';
import type { ReviewType } from 'common/types';
import Types from 'front/actions/types';
import { fixReviews, fixReview } from 'common/utils/reviews';
import { map, reduce, assoc, dissoc, curry } from 'ramda';

type State = ReviewsType;

const markLoading = curry((loading: boolean, review: ReviewType) => assoc('loading', loading, review));
const addReview = (state: State, review: ReviewType) => assoc(review.id, fixReview(markLoading(false, review)), state);
const deleteReview = (state: State, review: ReviewType) => dissoc(review.id, state);
const markDirty = (state: State, review: ReviewType) => assoc(review.id, markLoading(true, review), state);

export default (initialReviews: ReviewsType) => {
  return (state?: State, action:Action): State => {
    state = state || fixReviews(map(markLoading(false), initialReviews));

    if (action.type === Types.setReviews) {
      return reduce(addReview, state, action.reviews);
    }

    if (action.type === Types.setReview) {
      return addReview(state, action.review);
    }

    if (action.type === Types.reviewRemoved) {
      return deleteReview(state, action.review);
    }

    if (action.type === Types.deleteReview || action.type === Types.triggerVote || action.type === Types.triggerReportReview) {
      return markDirty(state, action.review);
    }

    return state;
  };
};
