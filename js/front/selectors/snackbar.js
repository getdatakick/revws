// @flow
import type { State } from 'front/reducer';

export const getMessage = (state: State): ?string => state.snackbar.message;
