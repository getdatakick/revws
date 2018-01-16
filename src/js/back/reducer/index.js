// @flow

import { combineReducers } from 'redux';
import type { FullCriteria, SettingsType } from 'back/types';
import snackbar from './snackbar';
import createSettings from './settings';
import createCriteria from './criteria';
import ui from './ui';
import data from './data';

const createReducer = (defaultSettings: SettingsType, defaultCriteria: FullCriteria) => {
  const settings = createSettings(defaultSettings);
  const criteria = createCriteria(defaultCriteria);
  return combineReducers({
    snackbar,
    ui,
    settings,
    criteria,
    data
  });
};

export default createReducer;
