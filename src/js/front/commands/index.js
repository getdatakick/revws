// @flow

import type { SettingsType, Command } from 'types';
import type { Action } from 'front/actions';
import { merge, prop } from 'ramda';
import { fixUrl } from 'utils/url';
import Types from 'front/actions/types';
import { saveReview } from './save-review';
import { deleteReview } from './delete-review';
import { voteReview } from './vote-review';
import { reportAbuse } from './report-review';

const commands = {
  [ Types.saveReview ]: saveReview,
  [ Types.deleteReview ]: deleteReview,
  [ Types.triggerVote]: voteReview,
  [ Types.triggerReportReview]: reportAbuse
};

export default (settings: SettingsType) => {
  const api = (cmd: string, payload: any) => {
    return new Promise((resolve, reject) => {
      const success = (data) => {
        if (data.success) {
          resolve({ type: 'success', data: data.result });
        } else {
          resolve({ type: 'failed', error: data.error });
        }
      };
      const error = (xhr, error) => resolve({ type: 'failed', error });
      window.$.ajax({
        url: fixUrl(settings.api),
        type: 'POST',
        dataType: 'json',
        data: merge(payload, {
          action: 'command',
          cmd: cmd,
        }),
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
