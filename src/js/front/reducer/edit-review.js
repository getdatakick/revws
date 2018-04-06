// @flow
import type { Action } from 'front/actions';
import type { EditStage, ReviewType, ProductInfoType } from 'common/types';
import type { SettingsType } from 'front/types';
import { formatName } from 'common/utils/format';
import { zipObj, repeat } from 'ramda';
import { getProduct } from 'front/settings';
import Types from 'front/actions/types';

type State = {
  review: ?ReviewType,
  stage: EditStage
}

const defaultState: State = {
  review: null,
  stage: 'edit'
};

const defaultReview = (settings: SettingsType, product: ProductInfoType):ReviewType => {
  const { email, firstName, lastName, pseudonym, nameFormat } = settings.visitor;

  return {
    id: -1,
    productId: product.id,
    authorType: settings.visitor.type,
    authorId: -1,
    customer: null,
    product: null,
    email,
    grades: zipObj(product.criteria, repeat(0, product.criteria.length)),
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

export default (settings: SettingsType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState;

    if (action.type === Types.triggerCreateReview) {
      return {
        ...state,
        review: defaultReview(settings, getProduct(action.productId, settings)),
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
