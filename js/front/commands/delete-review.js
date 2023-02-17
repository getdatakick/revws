// @flow

import type { Api } from 'common/types.js';
import type { DeleteReviewAction } from 'front/actions/index.js';
import { setSnackbar, reviewRemoved, setReview } from 'front/actions/creators.js';

export const deleteReview = (action: DeleteReviewAction, store: any, api: Api) => {
  const review = action.review;
  api('delete', { id: review.id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewRemoved(review));
      store.dispatch(setSnackbar(__('Review deleted')));
    } else {
      store.dispatch(setReview(review));
      store.dispatch(setSnackbar(__('Failed to delete review')));
    }
  });
};
