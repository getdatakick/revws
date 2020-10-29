// @flow
import type { State } from 'back/reducer';

export const getWidth = (state: State): number => state.ui.width;
export const getHeight = (state: State): number => state.ui.height;
