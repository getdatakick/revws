// @flow

import type { Api } from 'common/types.js';
import type { SaveReviewAction } from 'front/actions/index.js';
import type { ListType } from 'front/types.js';
import { saveReviewCompleted, setSnackbar, closeEditReview, setReview, loadList } from 'front/actions/creators.js';
import { fixReview } from 'common/utils/reviews.js';
import { getLists } from 'front/selectors/lists.js';
import { forEach, values } from 'ramda';

const closeDialog = (store:any) => setTimeout(() => store.dispatch(closeEditReview()), 1600);

const refreshList = (list: ListType) => loadList( list.id, list.conditions, list.page, list.pageSize, list.order, list.orderDir);

const refreshLists = (store:any) => {
  const lists = values(getLists(store.getState()));
  forEach(list => store.dispatch(refreshList(list)), lists);
};

export const saveReview = (action: SaveReviewAction, store: any, api: Api) => {
  const review = action.review;
  const create = review.id === -1;
  const cmd = create ? 'create' : 'update';
  api(cmd, review).then(result => {
    if (result.type === 'success') {
      const review = fixReview(result.data);
      store.dispatch(saveReviewCompleted(true));
      if (create) {
        store.dispatch(setSnackbar(__("Review has been created")));
        refreshLists(store);
      } else {
        store.dispatch(setSnackbar(__("Review has been updated")));
        store.dispatch(setReview(review));
      }
      closeDialog(store);
    } else {
      store.dispatch(saveReviewCompleted(false));
      store.dispatch(setSnackbar(__("Failed to create review")));
    }
  });
};
