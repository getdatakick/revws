// @flow

import type {
  SetSnackbarAction,
} from './index';
import Types from './types';

export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });
