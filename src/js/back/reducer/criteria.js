// @flow
import type { Action } from 'back/actions';
import type { FullCriteria } from 'back/types';
import { dissoc, assoc } from 'ramda';
import { asObject } from 'common/utils/input';
import Types from 'back/actions/types';

type State = {
  loading: boolean,
  criteria: FullCriteria,
}

const defaultState = (criteria) => ({
  loading: false,
  criteria
});

const fixCriteria = (crit: any): FullCriteria => asObject(crit);

export default (criteria: FullCriteria) => {
  return (state?: State, action:Action): State => {
    state = state || defaultState(fixCriteria(criteria));
    if (action.type === Types.saveCriterion || action.type === Types.migrateData) {
      return { ...state, loading: true };
    }
    if (action.type === Types.setCriteria) {
      return { loading: false, criteria: fixCriteria(action.criteria) };
    }
    if (action.type === Types.criterionSaved) {
      const crit = action.criterion;
      const criteria = assoc(crit.id, crit, state.criteria);
      return { loading: false, criteria };
    }
    if (action.type === Types.criterionDeleted) {
      const criteria = dissoc(action.id, state.criteria);
      return { loading: false, criteria };
    }
    return state;
  };
};
