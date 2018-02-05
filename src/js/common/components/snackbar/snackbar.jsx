// @flow
import React from 'react';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';

type Props = {
  message: ?string,
  setSnackbar: (?string) => void,
  anchorOrigin: {
    vertical: string,
    horizontal: string
  },
};

class AppSnackbar extends React.PureComponent<Props> {
  static displayName = 'AppSnackbar';

  static defaultProps = {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left'
    }
  }

  render() {
    const { anchorOrigin, message } = this.props;
    return (
      <Snackbar
        anchorOrigin={anchorOrigin}
        open={!!message}
        autoHideDuration={3000}
        onClose={this.onClose}
        message={message || ' '}
        action={[
          <Button key="close" color="accent" dense onClick={this.onClose}>
            {__('Close')}
          </Button>
        ]} />
    );
  }

  onClose = (e: Event, reason: ?string) => {
    if (reason != 'clickaway') {
      this.props.setSnackbar(null);
    }
  }
}

export default AppSnackbar;
