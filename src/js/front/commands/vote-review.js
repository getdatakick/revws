// @flow

import type { Api } from 'types';
import type { TriggerVoteAction } from 'front/actions';
import { setSnackbar } from 'front/actions/creators';

export const voteReview = (action: TriggerVoteAction, store: any, api: Api) => {
  api('vote', { id: action.review.id, direction: action.direction }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setSnackbar('Thank you for your vote!'));
    }
  });
};
