// @flow

import { prop } from 'ramda';
import type { GlobalDataType } from 'back/types';
import type { Command } from 'common/types';
import type { Action } from 'back/actions';
import { fixUrl } from 'common/utils/url';
import Types from 'back/actions/types';
import { saveSettings } from './save-settings';
import { deleteCriterion } from './delete-criterion';
import { saveCriterion } from './save-criterion';
import { loadData } from './load-data';

const commands = {
  [ Types.setSettings ]: saveSettings,
  [ Types.deleteCriterion ]: deleteCriterion,
  [ Types.saveCriterion ]: saveCriterion,
  [ Types.loadData ]: loadData
};

export default (settings: GlobalDataType) => {
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
        data: {
          ajax: true,
          action: 'command',
          cmd: cmd,
          payload: JSON.stringify(payload)
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
