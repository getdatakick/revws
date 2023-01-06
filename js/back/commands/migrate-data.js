// @flow

import type { Api } from 'common/types.js';
import type { MigrateDataAction } from 'back/actions/index.js';
import { setSnackbar, setCriteria, refreshData } from 'back/actions/creators.js';

export const migrateData = (action: MigrateDataAction, store: any, api: Api) => {
  const { source, payload } = action;
  api('migrateData', { source, payload }).then(result => {
    store.dispatch(refreshData());
    if (result.type === 'success') {
      store.dispatch(setCriteria(result.data.criteria));
      store.dispatch(setSnackbar(__('Data has been imported')));
    } else {
      store.dispatch(setSnackbar(__('Failed to migrate data')));
    }
  });
};
