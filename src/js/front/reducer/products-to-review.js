// @flow
import type { Action } from 'front/actions';
import type { SettingsType } from 'front/types';
import type { ReviewType } from 'common/types';
import { append, contains, reject, equals } from 'ramda';
import Types from 'front/actions/types';

type State = Array<number>;


const isCustomerReview = (settings: SettingsType, review: ReviewType) => {
  return (
    (review.authorType === settings.visitor.type) &&
    (review.authorId === settings.visitor.id)
  );
};

const remove = (productId, state) => reject(equals(productId), state);
const add = (productId, state) => {
  if (contains(productId, state)) {
    return state;
  }
  return append(productId, state);
};

export default (settings: SettingsType, productsToReview: Array<number>) => {
  return (state?: State, action:Action): State => {
    state = state || productsToReview;

    if (action.type === Types.setReview && isCustomerReview(settings, action.review)) {
      return remove(action.review.productId, state);
    }

    if (action.type === Types.deleteReview && isCustomerReview(settings, action.review)) {
      return add(action.review.productId, state);
    }

    if (action.type === Types.reviewRemoved && isCustomerReview(settings, action.review)) {
      return add(action.review.productId, state);
    }

    return state;
  };
};
