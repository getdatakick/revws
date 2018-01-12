//@flow

import React from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

type Props = {
  htmlFontSize: number,
  children: any
};

class AppTheme extends React.PureComponent<Props> {
  static displayName = 'AppTheme';

  render() {
    const { children, htmlFontSize } = this.props;
    const theme = createMuiTheme({
      typography: {
        htmlFontSize
      },
    });
    return (
      <MuiThemeProvider theme={theme}>
        { children }
      </MuiThemeProvider>
    );
  }
}

export default AppTheme;
