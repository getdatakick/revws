// @flow

import { combineReducers } from 'redux';
import snackbar from './snackbar';

const createReducer = () => {
  return combineReducers({
    snackbar
  });
};

export default createReducer;
