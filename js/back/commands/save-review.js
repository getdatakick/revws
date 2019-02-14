// @flow

import type { Api } from 'common/types';
import type { SaveReviewAction } from 'back/actions';
import { setSnackbar, reviewUpdated, reviewCreated } from 'back/actions/creators';
import { fixReview } from 'common/utils/reviews';
import moment from 'moment';

export const saveReview = (action: SaveReviewAction, store: any, api: Api) => {
  const review = {
    ...action.review,
    date: moment(action.review.date).format('YYYY-MM-DD')
  };
  api('saveReview', review).then(result => {
    if (result.type === 'success') {
      if (review.id > 0) {
        store.dispatch(reviewUpdated(fixReview(result.data)));
        store.dispatch(setSnackbar(__('Review saved')));
      } else {
        store.dispatch(reviewCreated(fixReview(result.data)));
        store.dispatch(setSnackbar(__('Review has been created')));
      }
    } else {
      store.dispatch(setSnackbar(__('Failed to save review')));
    }
  });
};
