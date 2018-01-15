// @flow

import type { Api } from 'common/types';
import type { SetSettingsAction } from 'back/actions';
import { setSnackbar } from 'back/actions/creators';

export const saveSettings = (action: SetSettingsAction, store: any, api: Api) => {
  api('saveSettings', { settings: JSON.stringify(action.settings) }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Settings successfully saved'));
    } else {
      store.dispatch(setSnackbar('Failed to update settings'));
    }
  });
};
