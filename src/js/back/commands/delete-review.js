// @flow

import type { Api } from 'common/types';
import type { DeleteReviewAction } from 'back/actions';
import { setSnackbar, reviewDeleted } from 'back/actions/creators';

export const deleteReview = (action: DeleteReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('deleteReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewDeleted(id));
      store.dispatch(setSnackbar('Review has been marked as deleted'));
    } else {
      store.dispatch(setSnackbar('Failed to delete review'));
    }
  });
};
