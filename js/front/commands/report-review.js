// @flow

import type { Api } from 'common/types.js';
import type { TriggerReportReviewAction } from 'front/actions/index.js';
import { setSnackbar, reviewRemoved, setReview } from 'front/actions/creators.js';
import { assoc } from 'ramda';

export const reportAbuse = (action: TriggerReportReviewAction, store: any, api: Api) => {
  const review = action.review;
  api('report', { id: review.id }).then(result => {
    if (result.type === 'success') {
      if (result.data.hide) {
        store.dispatch(reviewRemoved(review));
      } else {
        store.dispatch(setReview(assoc('canReport', false, review)));
      }
      store.dispatch(setSnackbar(__('Thank you for reporting this review')));
    } else {
      store.dispatch(setReview(review));
    }
  });
};
