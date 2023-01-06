// @flow

import type { Api } from 'common/types.js';
import type { SetSettingsAction } from 'back/actions/index.js';
import { setSnackbar } from 'back/actions/creators.js';

export const saveSettings = (action: SetSettingsAction, store: any, api: Api) => {
  api('saveSettings', action.settings).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar(__('Settings successfully saved')));
    } else {
      store.dispatch(setSnackbar(__('Failed to update settings')));
    }
  });
};
