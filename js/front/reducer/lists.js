// @flow
import type { Action } from 'front/actions';
import type { ListType, ListsType } from 'front/types';
import type { ReviewType } from 'common/types';
import { map, always, assoc, reject, merge, equals } from 'ramda';
import Types from 'front/actions/types';

type Modifier = (ListState) => ListState;

type ListState = ListType & {
  loading: boolean
};

export type State = {
  [ string ]: ListState
};


const defaultState = map(assoc('loading', false));

const updateLists = (func: Modifier, state: State) => map(func, state);

const updateList = (func: Modifier, id: string, state: State) => {
  if (state[id]) {
    const list = state[id];
    return assoc(id, func(list), state);
  }
  return state;
};

const removeReview = (review: ReviewType) => (list: ListState) => {
  const reviews = reject(equals(review.id), list.reviews);
  const diff = reviews.length - list.reviews.length;
  return diff == 0 ? list : merge(list, {
    reviews,
    total: list.total + diff
  });
};

const markLoading = assoc('loading');

export default (lists: ListsType): ((state?: State, action: Action) => State) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState(lists);

    if (action.type === Types.loadList) {
      return updateList(markLoading(true), action.listId, state);
    }

    if (action.type === Types.loadListFailed) {
      return updateList(markLoading(false), action.listId, state);
    }

    if (action.type === Types.setList) {
      return updateList(always(markLoading(false, action.list)), action.list.id, state);
    }

    if (action.type === Types.reviewRemoved) {
      return updateLists(removeReview(action.review), state);
    }

    return state;
  };
};
