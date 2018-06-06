// @flow

import { combineReducers } from 'redux';
import type { RoutingState } from 'back/routing';
import type { FullCriteria, SettingsType, VersionCheck } from 'back/types';
import snackbar from './snackbar';
import createSettings from './settings';
import createCriteria from './criteria';
import createRouting from './routing-state';
import ui from './ui';
import data from './data';
import createVersion from './version';

const createReducer = (route: RoutingState, defaultSettings: SettingsType, defaultCriteria: FullCriteria, version: string, versionCheck: VersionCheck) => {
  const settings = createSettings(defaultSettings);
  const criteria = createCriteria(defaultCriteria);
  const routingState = createRouting(route);
  return combineReducers({
    version: createVersion(version, versionCheck),
    routingState,
    snackbar,
    ui,
    settings,
    criteria,
    data,
  });
};

export default createReducer;
