// @flow

import type { Api } from 'common/types';
import type { ExportReviewsAction } from 'back/actions';
import { setSnackbar } from 'back/actions/creators';

export const exportReviews = (action: ExportReviewsAction, store: any, api: Api) => {
  api('export', {}).then(result => {
    if (result.type === 'success') {
      const blob = new Blob([result.data], { type: 'text/xml' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'revws.xml';
      link.style.display = 'none';
      const body = document.body;
      if (body) {
        body.appendChild(link);
        link.click();
        setTimeout(() => body.removeChild(link), 1000);
      }
      store.dispatch(setSnackbar(__('Reviews has been exported')));
    } else {
      store.dispatch(setSnackbar(__('Failed to export reviews')));
    }
  });
};
