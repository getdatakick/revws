// @flow
import type { Action } from 'front/actions';
import type { VisitorType } from 'front/types';
import type { EntityType, ReviewType } from 'common/types';
import { assoc, append, contains, reject, equals } from 'ramda';
import Types from 'front/actions/types';

export type State = {
  [ EntityType ]: {
    toReview: Array<number>,
    reviewed: Array<number>
  }
}


const isCustomerReview = (visitor: VisitorType, review: ReviewType) => {
  return (
    (review.authorType === visitor.type) &&
    (review.authorId === visitor.id)
  );
};

const remove = (entityId: number, list: Array<number>): Array<number> => reject(equals(entityId), list);

const add = (entityId: number, list: Array<number>): Array<number> => {
  if (contains(entityId, list)) {
    return list;
  }
  return append(entityId, list);
};

const updateLists = (visitor: VisitorType, review: ReviewType, state: State) => {
  const { entityId, entityType } = review;
  if (isCustomerReview(visitor, review)) {
    return assoc(entityType, {
      toReview: remove(entityId, state[entityType].toReview),
      reviewed: add(entityId, state[entityType].reviewed)
    }, state);
  }
  return state;
};

export default (visitor: VisitorType) => {
  return (state?: State, action:Action): State => {
    state = state || {
      product: {
        toReview: visitor.productsToReview,
        reviewed: visitor.reviewedProducts
      }
    };

    if (action.type === Types.setReviews) {
      const reviews: Array<ReviewType> = action.reviews;
      for (var i=0; i<reviews.length; i++) {
        const review = reviews[i];
        state = updateLists(visitor, review, state);
      }
      return state;
    }

    if (action.type === Types.setReview) {
      return updateLists(visitor, action.review, state);
    }

    if (action.type === Types.reviewRemoved && isCustomerReview(visitor, action.review)) {
      const { entityId, entityType } = action.review;
      return assoc(entityType, {
        toReview: remove(entityId, state[entityType].toReview),
        reviewed: add(entityId, state[entityType].reviewed)
      }, state);
    }

    return state;
  };
};
