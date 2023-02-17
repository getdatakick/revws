// @flow
import type { Action } from 'front/actions/index.js';
import Types from 'front/actions/types.js';

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
