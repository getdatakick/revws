// @flow
import type { State } from 'back/reducer';

export const getMessage = (state: State) => state.snackbar.message;
