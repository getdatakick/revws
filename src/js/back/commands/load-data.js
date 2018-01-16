// @flow

import type { Api } from 'common/types';
import type { LoadDataAction } from 'back/actions';
import { setSnackbar, setData } from 'back/actions/creators';

export const loadData = (action: LoadDataAction, store: any, api: Api) => {
  api('loadData', { types: action.types }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setData(result.data));
    } else {
      store.dispatch(setSnackbar('Failed to load data'));
    }
  });
};
