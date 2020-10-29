// @flow

import { combineReducers } from 'redux';
import type { RoutingState } from 'back/routing';
import type { FullCriteria, SettingsType, AccountType } from 'back/types';
import snackbar from './snackbar';
import createSettings from './settings';
import createCriteria from './criteria';
import createRouting from './routing-state';
import ui from './ui';
import data from './data';
import createAccount from './account';

import type { State as StateSnackbar } from './snackbar';
import type { State as StateSettings } from './settings';
import type { State as StateCriteria } from './criteria';
import type { State as StateRouting } from './routing-state';
import type { State as StateUi } from './ui';
import type { State as StateData } from './data';
import type { State as StateAccount } from './account';

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
