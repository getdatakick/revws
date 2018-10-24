// @flow
import type { Action } from 'front/actions';
import Types from 'front/actions/types';
import type { SettingsType } from 'front/types';

export type State = {
  agreed: boolean
}

const defaultState: State = {
  agreed: false
};

export default (settings: SettingsType) => (state?: State, action:Action): State => {
  state = state || defaultState;

  if (action.type === Types.agreeGDPR) {
    return {
      agreed: action.agreed
    };
  }

  if (action.type === Types.closeEditReview || action.type === Types.saveReviewCompleted) {
    return {
      agreed: false,
    };
  }

  return state;
};
