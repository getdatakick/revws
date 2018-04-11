// @flow

import type { Api } from 'common/types';
import type { UploadYotpoCsvAction } from 'back/actions';
import { setSnackbar, setCriteria } from 'back/actions/creators';

export const uploadYotpoCsv = (action: UploadYotpoCsvAction, store: any, api: Api) => {
  api('importYotpo', { file: action.file }).then(result => {
    if (result.type === 'success') {
      const { total, success, siteReviews, errors } = result.data.result;
      store.dispatch(setCriteria(result.data.criteria));
      if (total === success) {
        store.dispatch(setSnackbar(__('%s reviews has been imported', success)));
      } else {
        store.dispatch(setSnackbar(__('%s reviews out of %s has been imported. See javascript console for more info!', success, total)));
      }
      console.info("YOTPO IMPORT");
      console.info("Total lines: "+total);
      console.info("Successfully imported: "+success);
      console.info("Skipped site reviews: "+siteReviews);
      for (let i=0; i<errors.length; i++) {
        console.error(errors[i]);
      }
    } else {
      store.dispatch(setSnackbar(__('Failed to import reviews: %s', result.error)));
    }
  });
};
