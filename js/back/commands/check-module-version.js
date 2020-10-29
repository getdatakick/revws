// @flow
import type { Api } from 'common/types';
import type { GlobalDataType } from 'back/types';
import type { CheckModuleVersionAction } from 'back/actions';
import { setLatestVersion, setSnackbar, checkModuleVersionFailed } from 'back/actions/creators';
import { validateVersion } from 'common/utils/validation';
import { versionNum } from 'common/utils/version';

export const checkModuleVersion = (data: GlobalDataType): ((action: CheckModuleVersionAction, store: any, api: Api) => void) => (action: CheckModuleVersionAction, store: any, api: Api) => {
  const { version, platform, platformVersion } = data;
  const currentVersion = data.version;
  const domain = location.hostname;
  const storeUrl = data.storeUrl || 'https://store.getdatakick.com/en/module/datakickweb/api';

  const error = err => {
    store.dispatch(checkModuleVersionFailed());
    console.info('Failed to check new version: ', err);
  };

  window.$.ajax({
    url: storeUrl,
    type: 'POST',
    dataType: 'json',
    data: {
      json: JSON.stringify({
        module: 'revws',
        command: 'version',
        payload: {
          domain,
          platform,
          platformVersion,
          licenseType: 'free',
          version: version,
        }
      })
    },
    success: (data) => {
      if (data && data.data && data.data.version) {
        const ver = data.data.version;
        const notes = data.data.notes || '';
        const paid = data.data.paid || null;
        const ts = (new Date()).getTime();
        const err = validateVersion(ver);
        if (! err) {
          store.dispatch(setLatestVersion(ver, ts, notes, paid));
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
