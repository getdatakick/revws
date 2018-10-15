// @flow
import type { State } from 'back/reducer';

export const isLoading = (state: State) => state.criteria.loading;
export const getFullCriteria = (state: State) => state.criteria.criteria;
