// @flow

import { forEach, keys, prop } from 'ramda';
import type { GlobalDataType } from 'back/types';
import type { Command } from 'common/types';
import type { Action } from 'back/actions';
import { fixUrl } from 'common/utils/url';
import Types from 'back/actions/types';
import { checkModuleVersion } from './check-module-version';
import { setLatestVersion } from './set-latest-version';
import { saveSettings } from './save-settings';
import { deleteCriterion } from './delete-criterion';
import { saveCriterion } from './save-criterion';
import { saveReview } from './save-review';
import { loadData } from './load-data';
import { approveReview } from './approve-review';
import { deleteReview } from './delete-review';
import { undeleteReview } from './undelete-review';
import { migrateData } from './migrate-data';
import { uploadYotpoCsv } from './upload-yopto';

export default (data: GlobalDataType) => {
  const commands = {
    [ Types.checkModuleVersion ]: checkModuleVersion(data),
    [ Types.setLatestVersion ]: setLatestVersion,
    [ Types.setSettings ]: saveSettings,
    [ Types.deleteCriterion ]: deleteCriterion,
    [ Types.saveCriterion ]: saveCriterion,
    [ Types.saveReview ]: saveReview,
    [ Types.loadData ]: loadData,
    [ Types.deleteReview ]: deleteReview,
    [ Types.undeleteReview ]: undeleteReview,
    [ Types.approveReview ]: approveReview,
    [ Types.migrateData ]: migrateData,
    [ Types.uploadYotpoCsv ]: uploadYotpoCsv
  };

  const url = fixUrl(data.api);
  const api = (cmd: string, payload: any) => {
    return new Promise((resolve, reject) => {
      const failure = (error: string) => {
        console.error("API call error: "+cmd+": "+error);
        resolve({ type: 'failed', error });
      };
      const success = (data) => {
        if (data.success) {
          resolve({ type: 'success', data: data.result });
        } else {
          failure(data.error);
        }
      };
      const error = (xhr, error) => failure(error);
      if (payload.file) {
        const data = new FormData();
        data.append('ajax', '1');
        data.append('action', 'command');
        data.append('cmd', cmd);
        forEach(key => data.append(key, payload[key]), keys(payload));
        window.$.ajax({
          url,
          data: data,
          cache: false,
          dataType: 'json',
          contentType: false,
          processData: false,
          type: 'POST',
          success,
          error
        });
      } else {
        window.$.ajax({
          url,
          type: 'POST',
          dataType: 'json',
          data: {
            ajax: true,
            action: 'command',
            cmd: cmd,
            payload: JSON.stringify(payload).replace(/\\n/g, "\\\\n")
          },
          success,
          error
        });
      }
    });
  };

  return (store: any) => (next: any) => (action: Action) => {
    const res = next(action);
    const command: Command = prop(action.type, commands);
    if (command) {
      command(action, store, api);
    }
    return res;
  };
};
