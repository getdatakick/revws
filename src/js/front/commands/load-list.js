// @flow

import { pick } from 'ramda';
import type { Api, ReviewListType } from 'common/types';
import type { EntitiesType } from 'front/types';
import type { LoadListAction } from 'front/actions';
import { setSnackbar, setReviews, setList, loadListFailed, mergeEntities } from 'front/actions/creators';
import { getList } from 'front/utils/list';

export const loadList = (action: LoadListAction, store: any, api: Api) => {
  const payload = pick(['conditions', 'listId', 'page', 'pageSize', 'order', 'orderDir'], action);
  const listId = action.listId;
  const conditions = action.conditions;
  api('loadList', payload).then(result => {
    if (result.type === 'success') {
      const list: ReviewListType = result.data.list;
      const entities: EntitiesType = result.data.entities;
      store.dispatch(mergeEntities(entities));
      store.dispatch(setReviews(list.reviews));
      store.dispatch(setList(getList(listId, conditions, list)));
    } else {
      store.dispatch(setSnackbar(__('Failed to load reviews')));
      store.dispatch(loadListFailed(listId));
    }
  });
};
