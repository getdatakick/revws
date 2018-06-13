// @flow

import type { Api } from 'common/types';
import type { DeleteReviewAction } from 'back/actions';
import { setSnackbar, reviewUpdated, reviewDeleted } from 'back/actions/creators';
import { fixReview } from 'common/utils/reviews';

export const deleteReview = (action: DeleteReviewAction, store: any, api: Api) => {
  const { id, permanently } = action;
  api('deleteReview', { id, permanently }).then(result => {
    if (result.type === 'success') {
      if (permanently) {
        store.dispatch(reviewDeleted(id));
        store.dispatch(setSnackbar(__('Review has been deleted')));
      } else {
        store.dispatch(reviewUpdated(fixReview(result.data)));
        store.dispatch(setSnackbar(__('Review has been marked as deleted')));
      }
    } else {
      store.dispatch(setSnackbar(__('Failed to delete review')));
    }
  });
};
