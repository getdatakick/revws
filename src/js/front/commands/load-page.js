// @flow

import type { Api } from 'common/types';
import type { LoadPageAction } from 'front/actions';
import { setSnackbar, setReviews } from 'front/actions/creators';
import { getReviews } from 'front/settings';

export const loadPage = (action: LoadPageAction, store: any, api: Api) => {
  api('loadReviews', { productId: action.productId, page: action.page }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setReviews(getReviews({ reviews: result.data })));
    } else {
      store.dispatch(setSnackbar('Failed to load reviews'));
    }
  });
};
