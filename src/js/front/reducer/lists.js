// @flow
import type { Action } from 'front/actions';
import type { ListType, ListsType } from 'front/types';
import type { ReviewType } from 'common/types';
import { map, assoc, reject, merge, equals } from 'ramda';
import Types from 'front/actions/types';

type Modifier = (ListState) => ListState;

type ListState = ListType & {
  loading: boolean
};

type State = {
  [ string ]: ListState
};


const defaultState = map(assoc('loading', false));

const updateLists = (func: Modifier, state: State) => map(func, state);

const removeReview = (review: ReviewType) => (list: ListState) => {
  const reviews = reject(equals(review.id), list.reviews);
  const diff = reviews.length - list.reviews.length;
  return diff == 0 ? list : merge(list, {
    reviews,
    total: list.total + diff
  });
};

export default (lists: ListsType) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState(lists);

    if (action.type === Types.reviewRemoved) {
      return updateLists(removeReview(action.review), state);
    }

    return state;
  };
};
