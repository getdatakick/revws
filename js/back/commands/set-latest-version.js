// @flow

import type { Api } from 'common/types';
import type { SetLatestVersionAction } from 'back/actions';
import { pick } from 'ramda';

export const setLatestVersion = (action: SetLatestVersionAction, store: any, api: Api) => {
  api('setLatestVersion', pick(['version', 'ts', 'notes', 'paid'], action));
};
