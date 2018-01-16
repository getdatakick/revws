// @flow

import type { SettingsType, FullCriterion } from 'back/types';
import type { RoutingState } from 'back/routing';
import type {
  GoToAction,
  SetSizeAction,
  SetSnackbarAction,
  SetSettingsAction,
  SaveCriterionAction,
  CriterionSavedAction,
  DeleteCriterionAction,
  CriterionDeletedAction,
  LoadDataAction,
  SetDataAction
} from './index';
import Types from './types';

export const goTo = (routingState: RoutingState, updateHistory?:boolean = true): GoToAction => ({ type: Types.goTo, routingState, updateHistory });
export const setSnackbar = (message: ?string): SetSnackbarAction => ({ type: Types.setSnackbar, message });
export const setSize = (width: number, height: number): SetSizeAction => ({ type: Types.setSize, width, height });
export const setSettings = (settings: SettingsType): SetSettingsAction => ({ type: Types.setSettings, settings });
export const saveCriterion = (criterion: FullCriterion): SaveCriterionAction => ({ type: Types.saveCriterion, criterion });
export const criterionSaved = (criterion: FullCriterion): CriterionSavedAction => ({ type: Types.criterionSaved, criterion });
export const deleteCriterion = (id: number): DeleteCriterionAction => ({ type: Types.deleteCriterion, id });
export const criterionDeleted = (id: number): CriterionDeletedAction => ({ type: Types.criterionDeleted, id });

export const loadData = (types: Array<string>): LoadDataAction => ({ type: Types.loadData, types });
export const setData = (payload: any): SetDataAction => ({ type: Types.setData, payload });
