// @flow
import type { State } from 'back/reducer';

export const getMessage = (state: State): ?string => state.snackbar.message;
