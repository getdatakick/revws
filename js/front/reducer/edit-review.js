// @flow
import type { Action } from 'front/actions';
import type { EditStage, ReviewType } from 'common/types';
import type { VisitorType } from 'front/types';
import { formatName } from 'common/utils/format';
import Types from 'front/actions/types';

type State = {
  review: ?ReviewType,
  stage: EditStage
}

const defaultState: State = {
  review: null,
  stage: 'edit'
};

const defaultReview = (visitor: VisitorType, productId: number):ReviewType => {
  const { email, firstName, lastName, pseudonym, nameFormat, type, language} = visitor;

  return {
    id: -1,
    productId,
    authorType: type,
    authorId: -1,
    language,
    customer: null,
    product: null,
    email,
    grades: {},
    reply: null,
    displayName: formatName(firstName, lastName, pseudonym, nameFormat),
    title: '',
    content: null,
    underReview: true,
    deleted: false,
    date: new Date(),
    verifiedBuyer: false,
    canVote: false,
    canReport: false,
    canDelete: true,
    canEdit: true
  };
};

export default (visitor: VisitorType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState;

    if (action.type === Types.triggerCreateReview) {
      return {
        ...state,
        review: defaultReview(visitor, action.productId),
      };
    }

    if (action.type === Types.triggerEditReview) {
      return {
        ...state,
        review: action.review,
      };
    }

    if (action.type === Types.updateReviewDetails) {
      return { ...state, review: action.review };
    }

    if (action.type === Types.closeEditReview) {
      return defaultState;
    }

    if (action.type === Types.saveReview) {
      return { ...state, stage: 'saving' };
    }

    if (action.type === Types.saveReviewCompleted) {
      const stage = action.saved ? 'saved' : 'failed';
      return { ...state, stage };
    }

    return state;
  };
};
