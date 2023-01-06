// @flow
import type {State as StateSettings } from "back/reducer/settings";
import type { State } from 'back/reducer/index.js';

export const getSettings = (state: State): StateSettings => state.settings;
