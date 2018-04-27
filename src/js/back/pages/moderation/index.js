// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getSettings } from 'back/selectors/settings';
import { getFullCriteria } from 'back/selectors/criteria';
import Moderation from './moderation';
import { mergeCriteria } from 'back/utils/criteria';

const mapStateToProps = mapObject({
  settings: getSettings,
  fullCriteria: getFullCriteria
});

const actions = {
};

const connectRedux = connect(mapStateToProps, actions, mergeCriteria);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(Moderation);

export default ConnectedComponent;
