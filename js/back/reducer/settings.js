// @flow
import type { Action } from 'back/actions';
import type { SettingsType } from 'back/types';
import Types from 'back/actions/types';

export type State = SettingsType;

export default (defaultConfig: SettingsType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultConfig;

    if (action.type === Types.setSettings) {
      return action.settings;
    }

    return state;
  };
};
