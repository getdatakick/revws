// @flow

import type { Action } from 'front/actions/index.js';
import type { EntitiesType } from 'front/types.js';
import Types from 'front/actions/types.js';

export type State = EntitiesType;

export default (entities: EntitiesType): ((state?: State, action: Action) => State) => {
  return (state?: State, action:Action): State => {
    state = state || entities;

    if (action.type === Types.mergeEntities) {
      const { product } = action.entities;
      return {
        product: {...state.product, ...product }
      };
    }

    return state;
  };
};
