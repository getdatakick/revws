// @flow

import type { Api, ReviewListType } from 'common/types';
import type { LoadListAction } from 'front/actions';
import { setSnackbar, setReviews } from 'front/actions/creators';

export const loadPage = (action: LoadListAction, store: any, api: Api) => {
  api('loadReviews', { entityType: action.entityType, entityId: action.entityId, page: action.page }).then(result => {
    if (result.type === 'success') {
      const list: ReviewListType = result.data;
      store.dispatch(setReviews(list.reviews));
    } else {
      store.dispatch(setSnackbar(__('Failed to load reviews')));
    }
  });
};
