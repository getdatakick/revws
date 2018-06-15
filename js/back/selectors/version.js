// @flow

import { path } from 'ramda';
import { versionNum } from 'common/utils/version';

const get = (key: string) => path(['version', key]);

export const getLatestVersion = get('latestVersion');
export const getLastCheck = get('lastCheck');
export const getVersion = get('version');
export const getNotes = get('notes');
export const getPaidNotes = get('paid');
export const checkingVersion = get('checking');
export const isNewVersionAvailable = (state: any) => versionNum(getLatestVersion(state)) > versionNum(getVersion(state));
