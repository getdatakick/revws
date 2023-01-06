// @flow

import { combineReducers } from 'redux';
import type { RoutingState } from 'back/routing/index.js';
import type { FullCriteria, SettingsType, AccountType } from 'back/types.js';
import snackbar from './snackbar.js';
import createSettings from './settings.js';
import createCriteria from './criteria.js';
import createRouting from './routing-state.js';
import ui from './ui.js';
import data from './data.js';
import createAccount from './account.js';

import type { State as StateSnackbar } from './snackbar.js';
import type { State as StateSettings } from './settings.js';
import type { State as StateCriteria } from './criteria.js';
import type { State as StateRouting } from './routing-state.js';
import type { State as StateUi } from './ui.js';
import type { State as StateData } from './data.js';
import type { State as StateAccount } from './account.js';

export type State = {
  routingState: StateRouting,
  snackbar: StateSnackbar,
  ui: StateUi,
  settings: StateSettings,
  criteria: StateCriteria,
  data: StateData,
  account: StateAccount,
}

const createReducer = (route: RoutingState, defaultSettings: SettingsType, defaultCriteria: FullCriteria, accountData: AccountType): any => {
  const settings = createSettings(defaultSettings);
  const criteria = createCriteria(defaultCriteria);
  const routingState = createRouting(route);
  const account = createAccount(accountData);
  return combineReducers({
    routingState,
    snackbar,
    ui,
    settings,
    criteria,
    data,
    account
  });
};

export default createReducer;
