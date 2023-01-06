// @flow
import type {State as StateEntities} from "front/reducer/entities";
import type { State } from 'front/reducer/index.js';

export const getEntities = (state: State): StateEntities => state.entities;
