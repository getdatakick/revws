// @flow

import type { Api } from 'common/types';
import type { SaveReviewAction } from 'front/actions';
import { saveReviewCompleted, setSnackbar, closeEditReview, setReview } from 'front/actions/creators';
import { fixReview } from 'front/settings';

export const saveReview = (action: SaveReviewAction, store: any, api: Api) => {
  const review = action.review;
  const cmd = review.id === -1 ? 'create' : 'update';
  api(cmd, review).then(result => {
    const review = result.type === 'success' ? fixReview(result.data) : null;
    store.dispatch(saveReviewCompleted(!!review));
    store.dispatch(setSnackbar(review ? "Review has been created" : "Failed to create review"));
    if (review) {
      store.dispatch(setReview(review));
      setTimeout(() => {
        store.dispatch(closeEditReview());
      }, 1000);
    }
  });
};
