// @flow
import type { Action } from 'front/actions';
import Types from 'front/actions/types';
import type { SettingsType } from 'front/types';

type State = {
  needConsent: boolean,
  agreed: boolean
}

const defaultState = (needConsent: boolean): State => ({
  needConsent: needConsent,
  agreed: !needConsent
});

export default (settings: SettingsType) => (state?: State, action:Action): State => {
  state = state || defaultState(settings.gdpr.needConsent);

  if (action.type === Types.agreeGDPR) {
    return {
      ...state,
      agreed: action.agreed
    };
  }

  if (state.needConsent && action.type === Types.closeEditReview) {
    return {
      agreed: false,
      needConsent: true
    };
  }

  if (state.needConsent && action.type === Types.saveReviewCompleted) {
    return {
      agreed: true,
      needConsent: false
    };
  }

  return state;
};
