// @flow

import { pick } from 'ramda';
import type { Api, ReviewListType } from 'common/types';
import { reject, sortBy, identity } from 'ramda';
import type { EntitiesType } from 'front/types';
import type { LoadListAction } from 'front/actions';
import { setSnackbar, setReviews, setList, loadListFailed, mergeEntities } from 'front/actions/creators';
import { getList } from 'front/utils/list';


const getPayload = pick(['conditions', 'listId', 'page', 'pageSize', 'order', 'orderDir']);

const updateUrl = (id, list) => {
  if (window.history) {
    const location = window.location;
    const pageSizeParam = 'revws-' + id + '-page-size';
    const pageParam = 'revws-' + id + '-page';
    const searchParams = reject(param => param.indexOf(pageSizeParam) === 0 || param.indexOf(pageParam) == 0, location.search.replace('?', '').split('&'));
    searchParams.push(pageSizeParam+'='+list.pageSize);
    searchParams.push(pageParam+'='+(list.page+1));
    const search = sortBy(identity, searchParams).join('&');
    const pathname = location.pathname;
    const hash = location.hash;
    const url = pathname+'?'+search+hash;
    window.history.replaceState({}, '', url);
  }
};

export const loadList = (action: LoadListAction, store: any, api: Api) => {
  const payload = getPayload(action);
  const listId = action.listId;
  const conditions = action.conditions;
  api('loadList', payload).then(result => {
    if (result.type === 'success') {
      const list: ReviewListType = result.data.list;
      const entities: EntitiesType = result.data.entities;
      store.dispatch(mergeEntities(entities));
      store.dispatch(setReviews(list.reviews));
      store.dispatch(setList(getList(listId, conditions, list)));
      updateUrl(listId, list);
    } else {
      store.dispatch(setSnackbar(__('Failed to load reviews')));
      store.dispatch(loadListFailed(listId));
    }
  });
};
