// @flow

import { merge } from 'ramda';
import type { Action } from 'front/actions';
import type { EntitiesType } from 'front/types';
import Types from 'front/actions/types';

type State = EntitiesType;

export default (entities: EntitiesType) => {
  return (state?: State, action:Action): State => {
    state = state || entities;

    if (action.type === Types.mergeEntities) {
      return {
        products: merge(state.products, action.entities.products)
      };
    }

    return state;
  };
};
