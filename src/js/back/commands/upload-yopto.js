// @flow

import type { Api } from 'common/types';
import type { UploadYotpoCsvAction } from 'back/actions';
import { setSnackbar } from 'back/actions/creators';

export const uploadYotpoCsv = (action: UploadYotpoCsvAction, store: any, api: Api) => {
  api('importYotpo', { file: action.file }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar(__('Reviews has been imported')));
    } else {
      store.dispatch(setSnackbar(__('Failed to import reviews: %s', result.error)));
    }
  });
};
