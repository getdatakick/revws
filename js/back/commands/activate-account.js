// @flow
import type { Api } from 'common/types';
import type { GlobalDataType } from 'back/types';
import type { ActivateAccountAction } from 'back/actions';
import { activateAccountFailed, setSnackbar } from 'back/actions/creators';

export const activateAccount = (data: GlobalDataType) => (action: ActivateAccountAction, store: any, api: Api) => {
  const payload = {
    module: 'revws',
    version: data.version,
    email: action.email,
    domain: location.hostname,
    emailPreferences: action.emailPreferences
  };
  const url = data.versionUrl.replace(/\/version$/, '/activate-module');
  window.$.ajax({
    url,
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(payload),
    success: (data) => {
      if (data && data.data) {
        api('activate', {});
      }
    },
    error: (res) => {
      if (res.responseJSON && res.responseJSON.error) {
        store.dispatch(setSnackbar(res.responseJSON.error));
      }
      store.dispatch(activateAccountFailed());
    },
  });
};
