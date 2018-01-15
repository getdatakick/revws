// @flow

import type { Api } from 'common/types';
import type { TriggerReportReviewAction } from 'front/actions';
import { setSnackbar, reviewRemoved } from 'front/actions/creators';

export const reportAbuse = (action: TriggerReportReviewAction, store: any, api: Api) => {
  const id = action.review.id;
  api('report', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Thank you for reporting this review'));
      if (result.data.hide) {
        store.dispatch(reviewRemoved(id));
      }
    }
  });
};
