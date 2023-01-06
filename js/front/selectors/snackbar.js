// @flow
import type { State } from 'front/reducer/index.js';

export const getMessage = (state: State): ?string => state.snackbar.message;
