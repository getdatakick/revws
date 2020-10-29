// @flow
import type {FullCriteria} from "../types";import type { State } from 'back/reducer';

export const isLoading = (state: State): boolean => state.criteria.loading;
export const getFullCriteria = (state: State): FullCriteria => state.criteria.criteria;
