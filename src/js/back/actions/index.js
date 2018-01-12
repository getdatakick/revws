// @flow
export type SetSnackbarAction = {
  type: 'SET_SNACKBAR',
  message: ?string
}

export type Action = (
  SetSnackbarAction
);
