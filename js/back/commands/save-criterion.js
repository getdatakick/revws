// @flow

import type { Api } from 'common/types.js';
import type { SaveCriterionAction } from 'back/actions/index.js';
import { setSnackbar, criterionSaved } from 'back/actions/creators.js';

export const saveCriterion = (action: SaveCriterionAction, store: any, api: Api) => {
  api('saveCriterion', action.criterion).then(result => {
    if (result.type === 'success') {
      const criterion = result.data;
      store.dispatch(criterionSaved(criterion));
      store.dispatch(setSnackbar(__('Criterion saved')));
    } else {
      store.dispatch(setSnackbar(__('Failed to save criterion')));
    }
  });
};
