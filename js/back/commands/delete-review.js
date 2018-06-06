// @flow

import type { Api } from 'common/types';
import type { DeleteReviewAction } from 'back/actions';
import { setSnackbar, reviewUpdated } from 'back/actions/creators';
import { fixReview } from 'common/utils/reviews';

export const deleteReview = (action: DeleteReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('deleteReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewUpdated(fixReview(result.data)));
      store.dispatch(setSnackbar(__('Review has been marked as deleted')));
    } else {
      store.dispatch(setSnackbar(__('Failed to delete review')));
    }
  });
};
