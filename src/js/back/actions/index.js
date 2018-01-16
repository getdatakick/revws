// @flow
import type { SettingsType, FullCriterion } from 'back/types';

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

export type SaveCriterionAction = {
  type: 'SAVE_CRITERION',
  criterion: FullCriterion
}

export type CriterionSavedAction = {
  type: 'CRITERION_SAVED',
  criterion: FullCriterion
}

export type DeleteCriterionAction = {
  type: 'DELETE_CRITERION',
  id: number
}

export type CriterionDeletedAction = {
  type: 'CRITERION_DELETED',
  id: number
}

export type LoadDataAction = {
  type: 'LOAD_DATA',
  types: Array<string>
}

export type SetDataAction = {
  type: 'SET_DATA',
  payload: any
}

export type Action = (
  LoadDataAction |
  SetDataAction |
  SetSettingsAction |
  SetSnackbarAction |
  SetSizeAction |
  SaveCriterionAction |
  CriterionSavedAction |
  DeleteCriterionAction |
  CriterionDeletedAction
);
