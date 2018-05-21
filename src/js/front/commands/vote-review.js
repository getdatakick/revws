// @flow

import type { Api } from 'common/types';
import type { TriggerVoteAction } from 'front/actions';
import { assoc } from 'ramda';
import { setReview, setSnackbar } from 'front/actions/creators';

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
