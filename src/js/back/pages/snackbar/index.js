
// @flow
import type { ComponentType } from 'react';
import Snackbar from 'common/components/snackbar/snackbar';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getMessage } from 'back/selectors/snackbar';
import { setSnackbar } from 'back/actions/creators';

const mapStateToProps = mapObject({
  message: getMessage,
});

const actions = {
  setSnackbar: setSnackbar,
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{}> = connectRedux(Snackbar);

export default ConnectedComponent;
