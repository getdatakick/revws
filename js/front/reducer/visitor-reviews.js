// @flow
import type { Action } from 'front/actions';
import type { VisitorType } from 'front/types';
import type { EntityType, ReviewType } from 'common/types';
import { append, contains, reject, equals } from 'ramda';
import Types from 'front/actions/types';

export type State = {
  reviewed: {
    [ EntityType ]: Array<number>
  },
  toReview: {
    [ EntityType ]: Array<number>
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

const updateLists = (visitor: VisitorType, review: ReviewType, toAdd: boolean, state: State) => {
  const { entityId, entityType } = review;
  if (isCustomerReview(visitor, review)) {
    const toReviewFunc = toAdd ? remove : add;
    const reviewedFunc = toAdd ? add : remove;
    return {
      toReview: {
        ...state.toReview,
        [ entityType ]: toReviewFunc(entityId, state.toReview[entityType]),
      },
      reviewed: {
        ...state.reviewed,
        [ entityType ]: reviewedFunc(entityId, state.reviewed[entityType])
      }
    };
  }
  return state;
};

export default (visitor: VisitorType) => {
  return (state?: State, action:Action): State => {
    state = state || {
      toReview: visitor.toReview,
      reviewed: visitor.reviewed
    };

    if (action.type === Types.setReviews) {
      const reviews: Array<ReviewType> = action.reviews;
      for (var i=0; i<reviews.length; i++) {
        const review = reviews[i];
        state = updateLists(visitor, review, true, state);
      }
      return state;
    }

    if (action.type === Types.setReview) {
      return updateLists(visitor, action.review, true, state);
    }

    if (action.type === Types.reviewRemoved && isCustomerReview(visitor, action.review)) {
      return updateLists(visitor, action.review, false, state);
    }

    return state;
  };
};
