// @flow

import type { Api } from 'common/types';
import type { SaveReviewAction } from 'back/actions';
import { setSnackbar, reviewSaved } from 'back/actions/creators';
import { fixReview } from 'common/utils/reviews';

export const saveReview = (action: SaveReviewAction, store: any, api: Api) => {
  const review = action.review;
  api('saveReview', review).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewSaved(fixReview(result.data)));
      store.dispatch(setSnackbar('Review saved'));
    } else {
      store.dispatch(setSnackbar('Failed to save review'));
    }
  });
};
