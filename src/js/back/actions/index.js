// @flow
import type { SettingsType} from 'back/types';

export type SetSnackbarAction = {
  type: 'SET_SNACKBAR',
  message: ?string
}

export type SetSizeAction = {
  type: 'SET_SIZE',
  width: number,
  height: number
}

export type SetSettingsAction = {
  type: 'SET_SETTINGS',
  settings: SettingsType
}

export type Action = (
  SetSettingsAction |
  SetSnackbarAction |
  SetSizeAction
);
