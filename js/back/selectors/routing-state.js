// @flow

import type {State as StateRouting} from "back/reducer/routing-state";
import type { State } from 'back/reducer';

export const getRoutingState = (state: State): StateRouting => state.routingState;
