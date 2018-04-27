// @flow
import type { VersionCheck } from 'back/types';
import type { Action } from 'back/actions';
import Types from 'back/actions/types';

type State = {
  version: string,
  latestVersion: ?string,
  lastCheck: ?number,
  notes: ?string,
  checking: boolean
}

const initialState = (version: string, versionCheck: VersionCheck): State => {
  return {
    version,
    latestVersion: versionCheck.version,
    lastCheck: versionCheck.ts,
    notes: versionCheck.notes,
    checking: false
  };
};

export default (version: string, versionCheck: VersionCheck) => {
  return (state?: State, action:Action): State => {
    state = state || initialState(version, versionCheck);

    if (action.type === Types.setLatestVersion) {
      return {
        ...state,
        latestVersion: action.version,
        lastCheck: action.ts,
        notes: action.notes,
        checking: false
      };
    }

    if (action.type === Types.checkModuleVersion) {
      return { ...state, checking: true };
    }

    if (action.type === Types.checkModuleVersionFailed) {
      return { ...state, checking: false };
    }

    return state;
  };
};
