// @flow
import type { Action } from 'front/actions';
import type { VisitorType } from 'front/types';
import type { ReviewType } from 'common/types';
import { append, contains, reject, equals } from 'ramda';
import Types from 'front/actions/types';

type State = {
  toReview: Array<number>,
  reviewed: Array<number>
}


const isCustomerReview = (visitor: VisitorType, review: ReviewType) => {
  return (
    (review.authorType === visitor.type) &&
    (review.authorId === visitor.id)
  );
};

const remove = (review: ReviewType, list: Array<number>): Array<number> => reject(equals(review.productId), list);
const add = (review: ReviewType, list: Array<number>): Array<number> => {
  if (contains(review.productId, list)) {
    return list;
  }
  return append(review.productId, list);
};

export default (visitor: VisitorType) => {
  return (state?: State, action:Action): State => {
    state = state || {
      toReview: visitor.productsToReview,
      reviewed: visitor.reviewedProducts
    };

    if (action.type === Types.setReview && isCustomerReview(visitor, action.review)) {
      return {
        toReview: remove(action.review, state.toReview),
        reviewed: add(action.review, state.reviewed)
      };
    }

    if (action.type === Types.deleteReview && isCustomerReview(visitor, action.review)) {
      return {
        toReview: add(action.review, state.toReview),
        reviewed: remove(action.review, state.reviewed)
      };
    }

    if (action.type === Types.reviewRemoved && isCustomerReview(visitor, action.review)) {
      return {
        toReview: add(action.review, state.toReview),
        reviewed: remove(action.review, state.reviewed)
      };
    }

    return state;
  };
};
