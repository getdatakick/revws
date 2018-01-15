// @flow

import { combineReducers } from 'redux';
import type { SettingsType } from 'back/types';
import snackbar from './snackbar';
import createSettings from './settings';
import ui from './ui';

const createReducer = (defaultSettings: SettingsType) => {
  const settings = createSettings(defaultSettings);
  return combineReducers({
    snackbar,
    ui,
    settings
  });
};

export default createReducer;
