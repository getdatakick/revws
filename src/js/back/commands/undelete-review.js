// @flow

import type { Api } from 'common/types';
import type { UndeleteReviewAction } from 'back/actions';
import { setSnackbar, reviewUndeleted } from 'back/actions/creators';

export const undeleteReview = (action: UndeleteReviewAction, store: any, api: Api) => {
  const id = action.id;
  api('undeleteReview', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(reviewUndeleted(id));
      store.dispatch(setSnackbar('Review has been activated'));
    } else {
      store.dispatch(setSnackbar('Failed to undelete review'));
    }
  });
};
