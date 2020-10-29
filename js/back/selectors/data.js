// @flow
import type {State as $IMPORTED_TYPE$_State} from "../reducer/data";import type { State } from 'back/reducer';

export const getEntities = (state: State): ?any => state.data.entities;
export const getProducts = (state: State): ?any => state.data.products;
export const getCustomers = (state: State): ?any => state.data.customers;
export const getCategories = (state: State): ?any => state.data.categories;

export const getData = (state: State): $IMPORTED_TYPE$_State => state.data;
