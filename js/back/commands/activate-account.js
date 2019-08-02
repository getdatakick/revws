// @flow
import type { Api } from 'common/types';
import type { GlobalDataType } from 'back/types';
import type { ActivateAccountAction } from 'back/actions';
import { activateAccountFailed, setSnackbar } from 'back/actions/creators';

export const activateAccount = (data: GlobalDataType) => (action: ActivateAccountAction, store: any, api: Api) => {
  const url = data.storeUrl || 'https://store.getdatakick.com/en/module/datakickweb/api';
  window.$.ajax({
    url,
    type: 'POST',
    dataType: 'json',
    data: {
      json: JSON.stringify({
        module: 'revws',
        command: 'activate',
        payload: {
          domain: location.hostname,
          version: data.version,
          licenseType: 'free',
          platform: data.platform,
          platformVersion: data.platformVersion,
          email: action.email,
          emailPreferences: action.emailPreferences
        }
      })
    },
    success: (data) => {
      if (data) {
        if (data.error) {
          store.dispatch(setSnackbar(data.error));
          store.dispatch(activateAccountFailed());
        } else {
          api('activate', {});
        }
      } else {
        store.dispatch(activateAccountFailed());
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
