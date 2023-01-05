// @flow
import type { State as StateData } from "back/reducer/data";
import type { State } from 'back/reducer';

export const getEntities = (state: State): ?any => state.data.entities;
export const getProducts = (state: State): ?any => state.data.products;
export const getCustomers = (state: State): ?any => state.data.customers;
export const getCategories = (state: State): ?any => state.data.categories;

export const getData = (state: State): StateData=> state.data;
