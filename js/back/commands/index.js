// @flow

import { forEach, keys, prop } from 'ramda';
import type { GlobalDataType } from 'back/types.js';
import type { Command } from 'common/types.js';
import type { Action } from 'back/actions/index.js';
import { fixUrl } from 'common/utils/url.js';
import Types from 'back/actions/types.js';
import { checkModuleVersion } from './check-module-version.js';
import { setLatestVersion } from './set-latest-version.js';
import { saveSettings } from './save-settings.js';
import { deleteCriterion } from './delete-criterion.js';
import { saveCriterion } from './save-criterion.js';
import { saveReview } from './save-review.js';
import { loadData } from './load-data.js';
import { approveReview } from './approve-review.js';
import { deleteReview } from './delete-review.js';
import { undeleteReview } from './undelete-review.js';
import { migrateData } from './migrate-data.js';
import { uploadYotpoCsv } from './upload-yopto.js';
import { exportReviews } from './export-reviews.js';
import { activateAccount } from './activate-account.js';
import { setReviewed } from './set-reviewed.js';

export default (data: GlobalDataType): ((store: any) => (next: any) => (action: Action) => any) => {
  const commands = {
    [ Types.checkModuleVersion ]: checkModuleVersion(data),
    [ Types.activateAccount ]: activateAccount(data),
    [ Types.setLatestVersion ]: setLatestVersion,
    [ Types.setReviewed ]: setReviewed,
    [ Types.setSettings ]: saveSettings,
    [ Types.deleteCriterion ]: deleteCriterion,
    [ Types.saveCriterion ]: saveCriterion,
    [ Types.saveReview ]: saveReview,
    [ Types.loadData ]: loadData,
    [ Types.deleteReview ]: deleteReview,
    [ Types.undeleteReview ]: undeleteReview,
    [ Types.approveReview ]: approveReview,
    [ Types.migrateData ]: migrateData,
    [ Types.uploadYotpoCsv ]: uploadYotpoCsv,
    [ Types.exportReviews ]: exportReviews,
  };

  const url = fixUrl(data.api);
  const api = (cmd: string, payload: any) => {
    return new Promise((resolve, reject) => {
      const failure = (error: string) => {
        console.error("API call error: "+cmd+": "+error);
        resolve({ type: 'failed', error });
      };
      const success = (data:any) => {
        if (data.success) {
          resolve({ type: 'success', data: data.result });
        } else {
          failure(data.error);
        }
      };
      const error = (xhr:any, error:any) => failure(error);
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
            payload: JSON.stringify(payload)
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
