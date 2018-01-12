// @flow
import React from 'react';
import Snackbar from 'back/pages/snackbar';

type Props = {
};

class BackApp extends React.PureComponent<Props> {
  static displayName = 'BackApp';

  render() {
    return (
      <div>
        <Snackbar anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}/>
      </div>
    );
  }
}

export default BackApp;
