// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { isNewVersionAvailable, getLatestVersion, checkingVersion, getLastCheck, getNotes, getPaidNotes } from 'back/selectors/account';
import { checkModuleVersion } from 'back/actions/creators';
import SupportPage from './support';

const mapStateToProps = mapObject({
  newVersionAvailable: isNewVersionAvailable,
  lastCheck: getLastCheck,
  latestVersion: getLatestVersion,
  checking: checkingVersion,
  notes: getNotes,
  paidNotes: getPaidNotes
});

const actions = {
  checkUpdate: checkModuleVersion
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(SupportPage);

export default ConnectedComponent;
