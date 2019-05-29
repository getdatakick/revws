// @flow
import type { AccountType } from 'back/types';
import type { Action } from 'back/actions';
import Types from 'back/actions/types';

export type State = {
  activated: boolean,
  shouldReview: boolean,
  version: string,
  latestVersion: ?string,
  lastCheck: ?number,
  notes: ?string,
  paid: ?string,
  checking: boolean
}

const initialState = (account: AccountType): State => {
  const versionCheck = account.versionCheck;
  return {
    activated: account.activated,
    shouldReview: account.shouldReview,
    version: account.version,
    latestVersion: versionCheck.version,
    lastCheck: versionCheck.ts,
    notes: versionCheck.notes,
    paid: versionCheck.paid,
    checking: false
  };
};

export default (account: AccountType) => {
  return (state?: State, action:Action): State => {
    state = state || initialState(account);

    if (action.type === Types.setLatestVersion) {
      return {
        ...state,
        latestVersion: action.version,
        lastCheck: action.ts,
        notes: action.notes,
        paid: action.paid,
        checking: false
      };
    }

    if (action.type === Types.checkModuleVersion) {
      return { ...state, checking: true };
    }

    if (action.type === Types.checkModuleVersionFailed) {
      return { ...state, checking: false };
    }

    if (action.type === Types.activateAccount) {
      return { ...state, activated: true };
    }

    if (action.type === Types.activateAccountFailed) {
      return { ...state, activated: false };
    }

    return state;
  };
};
