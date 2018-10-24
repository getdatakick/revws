// @flow
import type { State } from 'front/reducer';

export const getMessage = (state: State) => state.snackbar.message;
