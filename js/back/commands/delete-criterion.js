// @flow

import type { Api } from 'common/types';
import type { DeleteCriterionAction } from 'back/actions';
import { setSnackbar, criterionDeleted } from 'back/actions/creators';

export const deleteCriterion = (action: DeleteCriterionAction, store: any, api: Api) => {
  const id = action.id;
  api('deleteCriterion', { id }).then(result => {
    if (result.type === 'success') {
      store.dispatch(criterionDeleted(id));
      store.dispatch(setSnackbar(__('Criterion deleted')));
    } else {
      store.dispatch(setSnackbar(__('Failed to delete criterion')));
    }
  });
};
