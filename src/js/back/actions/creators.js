// @flow

import type { SettingsType } from 'back/types';
import type {
  SetSizeAction,
  SetSnackbarAction,
  SetSettingsAction
} from './index';
import Types from './types';

export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });
export const setSize = (width: number, height: number): SetSizeAction => ({ type: Types.setSize, width, height });
export const setSettings = (settings: SettingsType): SetSettingsAction => ({ type: Types.setSettings, settings });
