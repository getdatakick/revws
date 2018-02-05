// @flow

import type { Api } from 'common/types';
import type { TriggerVoteAction } from 'front/actions';
import { setSnackbar } from 'front/actions/creators';

export const voteReview = (action: TriggerVoteAction, store: any, api: Api) => {
  api('vote', { id: action.review.id, direction: action.direction }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar(__('Thank you for your vote!')));
    }
  });
};
