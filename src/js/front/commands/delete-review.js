// @flow

import type { Api } from 'types';
import type { DeleteReviewAction } from 'front/actions';
import { setSnackbar } from 'front/actions/creators';

export const deleteReview = (action: DeleteReviewAction, store: any, api: Api) => {
  api('delete', { id: action.id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Review deleted'));
    } else {
      store.dispatch(setSnackbar('Failed to delete review'));
    }
  });
};
