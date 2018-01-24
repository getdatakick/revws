// @flow

import type { Api } from 'common/types';
import type { TriggerReportReviewAction } from 'front/actions';
import { setSnackbar, reviewRemoved } from 'front/actions/creators';

export const reportAbuse = (action: TriggerReportReviewAction, store: any, api: Api) => {
  const review = action.review;
  api('report', { id: review.id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Thank you for reporting this review'));
      if (result.data.hide) {
        store.dispatch(reviewRemoved(review));
      }
    }
  });
};
