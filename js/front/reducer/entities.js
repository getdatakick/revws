// @flow

import { merge, mapObjIndexed } from 'ramda';
import type { Action } from 'front/actions';
import type { EntitiesType } from 'front/types';
import Types from 'front/actions/types';

export type State = EntitiesType;

export default (entities: EntitiesType) => {
  return (state?: State, action:Action): State => {
    state = state || entities;

    if (action.type === Types.mergeEntities) {
      const entities = action.entities;
      return mapObjIndexed((values, entity) => {
        const newValues = entities[entity];
        if (newValues) {
          return merge(values, newValues);
        }
        return values;
      }, state);
    }

    return state;
  };
};
