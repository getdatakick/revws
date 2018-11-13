// @flow
import type { State } from 'back/reducer';

export const getEntities = (state: State) => state.data.entities;
export const getProducts = (state: State) => state.data.products;
export const getCustomers = (state: State) => state.data.customers;
export const getCategories = (state: State) => state.data.categories;

export const getData = (state: State) => state.data;
