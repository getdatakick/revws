// @flow

import type { Api } from 'common/types.js';
import type { TriggerVoteAction } from 'front/actions/index.js';
import { assoc } from 'ramda';
import { setReview, setSnackbar } from 'front/actions/creators.js';

export const voteReview = (action: TriggerVoteAction, store: any, api: Api) => {
  const review = action.review;
  api('vote', { id: review.id, direction: action.direction }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setReview(assoc('canVote', false, review)));
      store.dispatch(setSnackbar(__('Thank you for your vote!')));
    } else {
      store.dispatch(setReview(review));
    }
  });
};
