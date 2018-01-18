// @flow

import type { Api } from 'common/types';
import type { ApproveReviewAction } from 'back/actions';
import { setSnackbar, reviewApproved } from 'back/actions/creators';

export const approveReview = (action: ApproveReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('approveReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewApproved(id));
      store.dispatch(setSnackbar('Review has been approved'));
    } else {
      store.dispatch(setSnackbar('Failed to approve review'));
    }
  });
};
