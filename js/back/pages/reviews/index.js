// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType, SettingsType, GoTo, FullCriteria } from 'back/types';
import type { ReviewType } from 'common/types';
import type { State } from 'back/reducer';
import type { Props } from './reviews';
import type { SubPage } from 'back/routing/reviews';
import { connect } from 'react-redux';
import { getSettings } from 'back/selectors/settings';
import { getFullCriteria } from 'back/selectors/criteria';
import { exportReviews, saveReview } from 'back/actions/creators';
import Reviews from './reviews';
import { convertCriteria } from 'back/utils/criteria';

type OwnProps = {
  settings: SettingsType,
  fullCriteria: FullCriteria
}

type Actions = {
  saveReview: (ReviewType) => void,
  exportReviews: ()=>void
}

type PassedProps = {
  subpage: SubPage,
  goTo: GoTo,
  data: GlobalDataType
}

const mapStateToProps = (state: State): OwnProps => ({
  settings: getSettings(state),
  fullCriteria: getFullCriteria(state)
});

const actions = {
  saveReview,
  exportReviews
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps):Props => {
  const { fullCriteria, ...rest } = props;
  return {
    ...rest,
    ...actions,
    ...passed,
    criteria: convertCriteria(passed.data.language, fullCriteria)
  };
};

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(Reviews);

export default ConnectedComponent;
