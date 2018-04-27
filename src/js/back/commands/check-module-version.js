// @flow
import type { Api } from 'common/types';
import type { GlobalDataType } from 'back/types';
import type { CheckModuleVersionAction } from 'back/actions';
import { setLatestVersion, setSnackbar, checkModuleVersionFailed } from 'back/actions/creators';
import { validateVersion } from 'common/utils/validation';
import { versionNum } from 'common/utils/version';

export const checkModuleVersion = (data: GlobalDataType) => (action: CheckModuleVersionAction, store: any, api: Api) => {
  const module = 'revws';
  const { version, platform, platformVersion } = data;
  const currentVersion = data.version;
  const error = err => {
    store.dispatch(checkModuleVersionFailed());
    console.info('Failed to check new version: ', err);
  };
  const url = 'https://version.getdatakick.com/version';
  window.$.ajax({
    url,
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({ module, version: version, platform, platformVersion }),
    success: (data) => {
      if (data && data.data && data.data.version) {
        const ver = data.data.version;
        const notes = data.data.notes || '';
        const err = validateVersion(ver);
        if (! err) {
          store.dispatch(setLatestVersion(ver, (new Date()).getTime(), notes));
          if (versionNum(ver) > versionNum(currentVersion)) {
            store.dispatch(setSnackbar(__('New module version is available')));
          }
        } else {
          error(err+': '+ver);
        }
      } else {
        error(data.error);
      }
    },
    error: (res) => {
      if (res.status === 0) {
        error('Network issue - CORS / request has been terminated');
      } else {
        error(res.status+' '+res.statusText);
      }
    },
  });
};
