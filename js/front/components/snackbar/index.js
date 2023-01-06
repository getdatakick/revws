// @flow
import type { ComponentType } from 'react';
import type { State } from 'front/reducer/index.js';
import Snackbar from 'common/components/snackbar/snackbar.jsx';
import { connect } from 'react-redux';
import { getMessage } from 'front/selectors/snackbar.js';
import { setSnackbar } from 'front/actions/creators.js';

const mapStateToProps = (state: State) => ({
  message: getMessage(state),
});

const actions = {
  setSnackbar: setSnackbar,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(Snackbar);

export default ConnectedComponent;
