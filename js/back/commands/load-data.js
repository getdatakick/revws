// @flow

import type { Api } from 'common/types.js';
import type { LoadDataAction } from 'back/actions/index.js';
import { assoc } from 'ramda';
import { setSnackbar, setData } from 'back/actions/creators.js';
import { fixReviews } from 'common/utils/reviews.js';
import type { LoadTypes } from 'back/types.js';

const fixReviewPayload = (payload: any) => assoc('reviews', fixReviews(payload.reviews), payload);

const fixData = (load: LoadTypes, data: any) => {
  for (let k in load) {
    const def = load[k];
    if (def.record === 'reviews') {
      data = assoc(k, fixReviewPayload(data[k]), data);
    }
  }
  return data;
};

export const loadData = (action: LoadDataAction, store: any, api: Api) => {
  api('loadData', { types: action.types }).then(result => {
    if (result.type === 'success') {
      store.dispatch(setData(fixData(action.types, result.data)));
    } else {
      store.dispatch(setSnackbar(__('Failed to load data')));
    }
  });
};
