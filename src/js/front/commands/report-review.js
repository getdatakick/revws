// @flow

import type { Api } from 'common/types';
import type { TriggerReportReviewAction } from 'front/actions';
import { setSnackbar, reviewRemoved, setReview } from 'front/actions/creators';
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
