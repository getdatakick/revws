// @flow
import type { State } from 'back/reducer';

export const getWidth = (state: State) => state.ui.width;
export const getHeight = (state: State) => state.ui.height;
