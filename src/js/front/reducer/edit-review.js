// @flow
import type { Action } from 'front/actions';
import type { EditStage, ReviewType } from 'common/types';
import type { SettingsType, ProductInfoType } from 'front/types';
import { zipObj, repeat } from 'ramda';
import Types from 'front/actions/types';

type State = {
  review: ?ReviewType,
  stage: EditStage
}

const defaultState: State = {
  review: null,
  stage: 'edit'
};

const defaultReview = (settings: SettingsType, product: ProductInfoType):ReviewType => ({
  id: -1,
  productId: product.id,
  email: settings.visitor.email,
  grades: zipObj(product.criteria, repeat(0, product.criteria.length)),
  displayName: settings.visitor.displayName,
  title: '',
  content: null,
  underReview: true,
  date: new Date(),
  canVote: false,
  canReport: false,
  canDelete: true,
  canEdit: true
});

export default (settings: SettingsType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState;

    if (action.type === Types.triggerCreateReview) {
      return {
        ...state,
        review: defaultReview(settings, settings.product),
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
