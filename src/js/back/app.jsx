// @flow
import React from 'react';
import type { GlobalDataType } from 'back/types';
import Snackbar from 'back/pages/snackbar';
import Settings from 'back/pages/settings';
import styles from './app.less';
import AppTheme from 'common/components/theme/theme';

type Props = {
  data: GlobalDataType
};

class BackApp extends React.PureComponent<Props> {
  static displayName = 'BackApp';

  render() {
    const { data } = this.props;
    const snackbarPosition = { vertical: 'bottom', horizontal: 'right' };
    return (
      <AppTheme htmlFontSize={16}>
        <div className={styles.app}>
          <Settings data={data} />
          <Snackbar anchorOrigin={snackbarPosition} />
        </div>
      </AppTheme>
    );
  }
}

export default BackApp;
