// @flow
import type { Action } from 'front/actions';
import Types from 'front/actions/types';

export type State = {
  message: ?string
}

const defaultState: State = {
  message: null
};

export default (state?: State, action:Action): State => {
  state = state || defaultState;

  if (action.type === Types.setSnackbar) {
    return {
      message: action.message
    };
  }

  return state;
};
