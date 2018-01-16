// @flow

import { combineReducers } from 'redux';
import type { RoutingState } from 'back/routing';
import type { FullCriteria, SettingsType } from 'back/types';
import snackbar from './snackbar';
import createSettings from './settings';
import createCriteria from './criteria';
import createRouting from './routing-state';
import ui from './ui';
import data from './data';

const createReducer = (route: RoutingState, defaultSettings: SettingsType, defaultCriteria: FullCriteria) => {
  const settings = createSettings(defaultSettings);
  const criteria = createCriteria(defaultCriteria);
  const routingState = createRouting(route);
  return combineReducers({
    routingState,
    snackbar,
    ui,
    settings,
    criteria,
    data,
  });
};

export default createReducer;
