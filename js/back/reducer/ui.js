// @flow
import type { Action } from 'back/actions';
import Types from 'back/actions/types';

export type State = {
  width: number,
  height: number
}

const defaultState: State = {
  width: 1000,
  height: 100
};

export default (state?: State, action:Action): State => {
  state = state || defaultState;

  if (action.type === Types.setSize) {
    return {
      width: action.width,
      height: action.height
    };
  }

  return state;
};
