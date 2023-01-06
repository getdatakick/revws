// @flow

import type {State as StateRouting} from "back/reducer/routing-state";
import type { State } from 'back/reducer/index.js';

export const getRoutingState = (state: State): StateRouting => state.routingState;
