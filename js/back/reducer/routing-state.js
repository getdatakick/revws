// @flow

import type { Action } from 'back/actions/index.js';
import type { RoutingState } from 'back/routing/index.js';
import Types from 'back/actions/types.js';

type reducerType = (?RoutingState, Action) => RoutingState;

export type State = RoutingState;

export default (initialState: RoutingState): reducerType => {
  return (state: ?State, action: Action): State => {
    const curState = state || initialState;
    if (action.type === Types.goTo) {
      return action.routingState;
    }
    return curState;
  };
};
