
// @flow
import type { ComponentType } from 'react';
import Snackbar from './snackbar';
import { connect } from 'react-redux';
import { mapObject } from 'utils/redux';
import { getMessage } from 'front/selectors/snackbar';
import { setSnackbar } from 'front/actions/creators';

const mapStateToProps = mapObject({
  message: getMessage,
});

const actions = {
  setSnackbar: setSnackbar,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(Snackbar);

export default ConnectedComponent;
