// @flow
import type { State } from 'back/reducer/index.js';

export const getMessage = (state: State): ?string => state.snackbar.message;
