// @flow

import { versionNum } from 'common/utils/version';
import type { State } from 'back/reducer';

export const isActivated: ((State) => boolean) = state => state.account.activated;
export const getLatestVersion = (state: State): ?string => state.account.latestVersion;
export const getLastCheck =(state: State): ?number => state.account.lastCheck;
export const shouldReview =(state: State): boolean => state.account.shouldReview;
export const getVersion = (state: State): string => state.account.version;
export const getNotes = (state: State): ?string => state.account.notes;
export const getPaidNotes = (state: State): ?string => state.account.paid;
export const checkingVersion = (state: State): boolean => state.account.checking;
export const isNewVersionAvailable = (state: any): boolean => versionNum(getLatestVersion(state)) > versionNum(getVersion(state));
