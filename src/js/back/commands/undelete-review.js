// @flow

import type { Api } from 'common/types';
import type { UndeleteReviewAction } from 'back/actions';
import { setSnackbar, reviewUpdated } from 'back/actions/creators';
import { fixReview } from 'common/utils/reviews';

export const undeleteReview = (action: UndeleteReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('undeleteReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewUpdated(fixReview(result.data)));
      store.dispatch(setSnackbar(__('Review has been activated')));
    } else {
      store.dispatch(setSnackbar(__('Failed to undelete review')));
    }
  });
};
