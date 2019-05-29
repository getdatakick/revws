// @flow

import type { Api } from 'common/types';
import type { SetReviewedAction } from 'back/actions';
import { setSnackbar } from 'back/actions/creators';

export const setReviewed = (action: SetReviewedAction, store: any, api: Api) => {
  api('setReviewed', {})
    .then(() => store.dispatch(setSnackbar(__('Thank you for your review'))));
};
