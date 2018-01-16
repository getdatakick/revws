// @flow
import type { Action } from 'back/actions';
import Types from 'back/actions/types';
import { assoc } from 'ramda';
import { asObject } from 'common/utils/input';

type State = {
  products: ?any,
  categories: ?any
}

const defaultState = {
  products: null,
  categories: null
};

const mergePayload = (payload: any, state:State): State => {
  if (payload.products) {
    state = assoc('products', asObject(payload.products), state);
  }
  if (payload.categories) {
    state = assoc('categories', asObject(payload.categories), state);
  }
  return state;
};

export default (state?: State, action:Action): State => {
  state = state || defaultState;
  if (action.type === Types.setData) {
    return mergePayload(action.payload, state);
  }
  return state;
};
