// @flow
import type { ComponentType } from 'react';
import type { GlobalDataType } from 'back/types.js';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { isNewVersionAvailable, getLatestVersion, checkingVersion, getLastCheck, getNotes, getPaidNotes, shouldReview } from 'back/selectors/account.js';
import { checkModuleVersion, setReviewed } from 'back/actions/creators.js';
import SupportPage from './support.jsx';

const mapStateToProps = mapObject({
  newVersionAvailable: isNewVersionAvailable,
  lastCheck: getLastCheck,
  latestVersion: getLatestVersion,
  checking: checkingVersion,
  notes: getNotes,
  paidNotes: getPaidNotes,
  shouldReview: shouldReview,
});

const actions = {
  checkUpdate: checkModuleVersion,
  setReviewed: setReviewed,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{data: GlobalDataType}> = connectRedux(SupportPage);

export default ConnectedComponent;
