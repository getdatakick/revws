// @flow

import type { Action } from 'front/actions';
import type { EntitiesType } from 'front/types';
//import type { ProductInfoType } from 'common/types';
//import Types from 'front/actions/types';

type State = EntitiesType;

export default (entities: EntitiesType) => {
  return (state?: State, action:Action): State => {
    state = state || entities;
    return state;
  };
};
