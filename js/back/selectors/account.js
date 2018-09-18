// @flow

import { versionNum } from 'common/utils/version';
import type { State } from 'back/reducer';

export const isActivated = (state: State) => state.account.activated;
export const getLatestVersion = (state: State) => state.account.latestVersion;
export const getLastCheck =(state: State) => state.account.lastCheck;
export const getVersion = (state: State) => state.account.version;
export const getNotes = (state: State) => state.account.notes;
export const getPaidNotes = (state: State) => state.account.paid;
export const checkingVersion = (state: State) => state.account.checking;
export const isNewVersionAvailable = (state: any) => versionNum(getLatestVersion(state)) > versionNum(getVersion(state));
