// @flow
import type { Action } from 'back/actions/index.js';
import type { SettingsType } from 'back/types.js';
import Types from 'back/actions/types.js';

export type State = SettingsType;

export default (defaultConfig: SettingsType): ((state?: State, action: Action) => State) => {
  return (state?: State, action:Action): State => {
    state = state || defaultConfig;

    if (action.type === Types.setSettings) {
      return action.settings;
    }

    return state;
  };
};
