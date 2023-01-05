// @flow
import type {State as StateEntities} from "front/reducer/entities";
import type { State } from 'front/reducer';

export const getEntities = (state: State): StateEntities => state.entities;
