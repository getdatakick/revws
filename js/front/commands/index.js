// @flow

import type { Command } from 'common/types.js';
import type { SettingsType } from 'front/types.js';
import type { Action } from 'front/actions/index.js';
import { keys, forEach, mergeRight, prop } from 'ramda';
import { fixUrl } from 'common/utils/url.js';
import Types from 'front/actions/types.js';
import { saveReview } from './save-review.js';
import { deleteReview } from './delete-review.js';
import { voteReview } from './vote-review.js';
import { reportAbuse } from './report-review.js';
import { loadList } from './load-list.js';
import { uploadImage } from './upload-image.js';

const commands = {
  [ Types.saveReview ]: saveReview,
  [ Types.deleteReview ]: deleteReview,
  [ Types.triggerVote]: voteReview,
  [ Types.triggerReportReview]: reportAbuse,
  [ Types.loadList]: loadList,
  [ Types.uploadImage ]: uploadImage
};

export default (settings: SettingsType): ((store: any) => (next: any) => (action: Action) => any) => {
  let revwsToken = settings.csrf;

  const refreshToken = () => new Promise((resolve, reject) => {
    window.$.ajax({
      url: fixUrl(settings.api),
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'command',
        cmd: 'refreshToken'
      },
      success: (data) => {
        if (data.success) {
          revwsToken = data.result;
          resolve(data.result);
        } else {
          reject(data.error);
        }
      },
      error: () => {
        reject();
      }
    });
  });

  const api = (cmd: string, payload: any) => {
    return new Promise((resolve, reject) => {
      let firstAttempt = true;
      const failure = (error: string, errorCode: number) => {
        if (firstAttempt && errorCode === 900001) {
          firstAttempt = false;
          refreshToken()
            .then(callApi)
            .catch((error) => {
              console.error("Failed to refresh CSRF token:" +error);
              resolve({ type: 'failed', error });
            });
        } else {
          console.error("API call error: "+cmd+": "+error);
          resolve({ type: 'failed', error });
        }
      };
      const success = (data:any) => {
        if (data.success) {
          resolve({ type: 'success', data: data.result });
        } else {
          failure(data.error, data.errorCode);
        }
      };
      const error = (xhr:any, error:any) => failure(error, -1);
      const callApi = () => {
        if (payload.file) {
          const data = new FormData();
          data.append('ajax', '1');
          data.append('action', 'command');
          data.append('cmd', cmd);
          data.append('revwsToken', revwsToken);
          forEach(key => data.append(key, payload[key]), keys(payload));
          window.$.ajax({
            url: fixUrl(settings.api),
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
            url: fixUrl(settings.api),
            type: 'POST',
            dataType: 'json',
            data: mergeRight(payload, {
              action: 'command',
              cmd: cmd,
              revwsToken
            }),
            success,
            error
          });
        }
      };
      callApi();
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
