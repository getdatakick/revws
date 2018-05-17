// @flow
import type { Action } from 'front/actions';
import type { SettingsType } from 'front/types';
import type { ReviewType } from 'common/types';
import { append, contains, reject, equals } from 'ramda';
import Types from 'front/actions/types';

type State = {
  toReview: Array<number>,
  reviewed: Array<number>
}


const isCustomerReview = (settings: SettingsType, review: ReviewType) => {
  return (
    (review.authorType === settings.visitor.type) &&
    (review.authorId === settings.visitor.id)
  );
};

const remove = (review: ReviewType, list: Array<number>): Array<number> => reject(equals(review.productId), list);
const add = (review: ReviewType, list: Array<number>): Array<number> => {
  if (contains(review.productId, list)) {
    return list;
  }
  return append(review.productId, list);
};

export default (settings: SettingsType, toReview: Array<number>, reviewed: Array<number>) => {
  return (state?: State, action:Action): State => {
    state = state || {
      toReview,
      reviewed
    };

    if (action.type === Types.setReview && isCustomerReview(settings, action.review)) {
      return {
        toReview: remove(action.review, state.toReview),
        reviewed: add(action.review, state.reviewed)
      };
    }

    if (action.type === Types.deleteReview && isCustomerReview(settings, action.review)) {
      return {
        toReview: add(action.review, state.toReview),
        reviewed: remove(action.review, state.reviewed)
      };
    }

    if (action.type === Types.reviewRemoved && isCustomerReview(settings, action.review)) {
      return {
        toReview: add(action.review, state.toReview),
        reviewed: remove(action.review, state.reviewed)
      };
    }

    return state;
  };
};
