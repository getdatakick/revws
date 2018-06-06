// @flow

import type { Api } from 'common/types';
import type { MigrateDataAction } from 'back/actions';
import { setSnackbar, setCriteria } from 'back/actions/creators';

export const migrateData = (action: MigrateDataAction, store: any, api: Api) => {
  const { source, payload } = action;
  api('migrateData', { source, payload }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setCriteria(result.data.criteria));
      store.dispatch(setSnackbar(__('Data has been imported')));
    } else {
      store.dispatch(setSnackbar(__('Failed to migrate data')));
    }
  });
};
