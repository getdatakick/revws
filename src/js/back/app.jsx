// @flow
import React from 'react';
import type { SettingsType } from 'back/types';
import Snackbar from 'back/pages/snackbar';

type Props = {
  settings: SettingsType
};

class BackApp extends React.PureComponent<Props> {
  static displayName = 'BackApp';

  render() {
    const { settings } = this.props;
    const snackbarPosition = { vertical: 'top', horizontal: 'right' };
    return (
      <div>
        <pre>
          { JSON.stringify(settings, null, 2)}
        </pre>
        <Snackbar anchorOrigin={snackbarPosition} />
      </div>
    );
  }
}

export default BackApp;
