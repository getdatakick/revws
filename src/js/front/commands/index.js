// @flow

import type { Command } from 'common/types';
import type { SettingsType } from 'front/types';
import type { Action } from 'front/actions';
import { merge, prop } from 'ramda';
import { fixUrl } from 'common/utils/url';
import Types from 'front/actions/types';
import { saveReview } from './save-review';
import { deleteReview } from './delete-review';
import { voteReview } from './vote-review';
import { reportAbuse } from './report-review';
import { loadPage } from './load-page';

const commands = {
  [ Types.saveReview ]: saveReview,
  [ Types.deleteReview ]: deleteReview,
  [ Types.triggerVote]: voteReview,
  [ Types.triggerReportReview]: reportAbuse,
  [ Types.loadPage]: loadPage
};

export default (settings: SettingsType) => {
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
      window.$.ajax({
        url: fixUrl(settings.api),
        type: 'POST',
        dataType: 'json',
        data: merge(payload, {
          action: 'command',
          cmd: cmd,
        }),
        headers: {
          'X-REVWS-TOKEN': settings.csrf,
        },
        success,
        error
      });
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
