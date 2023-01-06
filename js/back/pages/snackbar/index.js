
// @flow
import type { ComponentType } from 'react';
import Snackbar from 'common/components/snackbar/snackbar.jsx';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { getMessage } from 'back/selectors/snackbar.js';
import { setSnackbar } from 'back/actions/creators.js';

const mapStateToProps = mapObject({
  message: getMessage,
});

const actions = {
  setSnackbar: setSnackbar,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(Snackbar);

export default ConnectedComponent;
