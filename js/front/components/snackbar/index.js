// @flow
import type { ComponentType } from 'react';
import type { State } from 'front/reducer';
import Snackbar from 'common/components/snackbar/snackbar';
import { connect } from 'react-redux';
import { getMessage } from 'front/selectors/snackbar';
import { setSnackbar } from 'front/actions/creators';

const mapStateToProps = (state: State) => ({
  message: getMessage(state),
});

const actions = {
  setSnackbar: setSnackbar,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(Snackbar);

export default ConnectedComponent;
