//@flow

import React from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

type Props = {
  htmlFontSize: number,
  children: any,
  zIndexBase?: number
};

class AppTheme extends React.PureComponent<Props> {
  static displayName = 'AppTheme';

  static defaultProps = {
    zIndexBase: 1000000
  }

  render() {
    const { zIndexBase, children, htmlFontSize } = this.props;
    const theme = createMuiTheme({
      typography: {
        htmlFontSize: htmlFontSize
      },
      zIndex: {
        mobileStepper: zIndexBase + 1000,
        appBar: zIndexBase + 1100,
        drawer: zIndexBase + 1200,
        modal: zIndexBase + 1300,
        snackbar: zIndexBase + 1400,
        tooltip: zIndexBase + 1500,
      }
    });
    return (
      <MuiThemeProvider theme={theme}>
        <div className="revws-reset">
          { children }
        </div>
      </MuiThemeProvider>
    );
  }
}

export default AppTheme;
