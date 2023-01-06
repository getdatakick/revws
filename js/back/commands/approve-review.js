// @flow

import type { Api } from 'common/types.js';
import type { ApproveReviewAction } from 'back/actions/index.js';
import { setSnackbar, reviewUpdated } from 'back/actions/creators.js';
import { fixReview } from 'common/utils/reviews.js';


export const approveReview = (action: ApproveReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('approveReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewUpdated(fixReview(result.data)));
      store.dispatch(setSnackbar(__('Review has been approved')));
    } else {
      store.dispatch(setSnackbar(__('Failed to approve review')));
    }
  });
};
