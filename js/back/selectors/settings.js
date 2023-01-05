// @flow
import type {State as StateSettings } from "back/reducer/settings";
import type { State } from 'back/reducer';

export const getSettings = (state: State): StateSettings => state.settings;
