// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getSettings } from 'back/selectors/settings';
import { getCriteria } from 'back/selectors/criteria';
import Home from './home';

const mapStateToProps = mapObject({
  settings: getSettings,
  criteria: getCriteria
});

const actions = {
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(Home);

export default ConnectedComponent;
