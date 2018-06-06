// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getWidth } from 'back/selectors/ui';
import { getSettings } from 'back/selectors/settings';
import { setSettings } from 'back/actions/creators';
import { getFullCriteria } from 'back/selectors/criteria';
import { mergeCriteria } from 'back/utils/criteria';
import Settings from './settings';

const mapStateToProps = mapObject({
  pageWidth: getWidth,
  fullCriteria: getFullCriteria,
  settings: getSettings
});

const actions = {
  saveSettings: setSettings
};

const connectRedux = connect(mapStateToProps, actions, mergeCriteria);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(Settings);

export default ConnectedComponent;
