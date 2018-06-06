// @flow

import type { Action } from 'back/actions';
import type { RoutingState } from 'back/routing';
import Types from 'back/actions/types';

type reducerType = (?RoutingState, Action) => RoutingState;

export default (initialState: RoutingState): reducerType => {
  const reducer = (state: ?RoutingState, action: Action): RoutingState => {
    const curState = state || initialState;
    if (action.type === Types.goTo) {
      return action.routingState;
    }
    return curState;
  };
  return reducer;
};
