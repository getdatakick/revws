// @flow

import type { Api } from 'common/types';
import type { TriggerReportReviewAction } from 'front/actions';
import { setSnackbar } from 'front/actions/creators';

export const reportAbuse = (action: TriggerReportReviewAction, store: any, api: Api) => {
  api('vote', { id: action.review.id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Thank you for reporting this review'));
    }
  });
};
