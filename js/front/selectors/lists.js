// @flow
import type { State as StateLists } from "front/reducer/lists";
import type { State } from 'front/reducer/index.js';

export const getLists = (state: State): StateLists => state.lists;
