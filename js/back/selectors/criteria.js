// @flow
import type {FullCriteria} from 'back/types.js';
import type { State } from 'back/reducer/index.js';

export const isLoading = (state: State): boolean => state.criteria.loading;
export const getFullCriteria = (state: State): FullCriteria => state.criteria.criteria;
