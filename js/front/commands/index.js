// @flow

import type { Command } from 'common/types';
import type { SettingsType } from 'front/types';
import type { Action } from 'front/actions';
import { keys, forEach, merge, prop } from 'ramda';
import { fixUrl } from 'common/utils/url';
import Types from 'front/actions/types';
import { saveReview } from './save-review';
import { deleteReview } from './delete-review';
import { voteReview } from './vote-review';
import { reportAbuse } from './report-review';
import { loadList } from './load-list';
import { uploadImage } from './upload-image';

const commands = {
  [ Types.saveReview ]: saveReview,
  [ Types.deleteReview ]: deleteReview,
  [ Types.triggerVote]: voteReview,
  [ Types.triggerReportReview]: reportAbuse,
  [ Types.loadList]: loadList,
  [ Types.uploadImage ]: uploadImage
};

export default (settings: SettingsType) => {
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
      const success = (data) => {
        if (data.success) {
          resolve({ type: 'success', data: data.result });
        } else {
          failure(data.error, data.errorCode);
        }
      };
      const error = (xhr, error) => failure(error, -1);
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
            data: merge(payload, {
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
