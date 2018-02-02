// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getSettings } from 'back/selectors/settings';
import { getCriteria } from 'back/selectors/criteria';
import { saveReview } from 'back/actions/creators';
import Reviews from './reviews';

const mapStateToProps = mapObject({
  settings: getSettings,
  criteria: getCriteria
});

const actions = {
  saveReview
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(Reviews);

export default ConnectedComponent;
