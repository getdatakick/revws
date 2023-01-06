// @flow

import type { Api } from 'common/types.js';
import type { SetReviewedAction } from 'back/actions/index.js';
import { setSnackbar } from 'back/actions/creators.js';

export const setReviewed = (action: SetReviewedAction, store: any, api: Api) => {
  api('setReviewed', {})
    .then(() => store.dispatch(setSnackbar(__('Thank you for your review'))));
};
