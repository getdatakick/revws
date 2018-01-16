// @flow
import React from 'react';
import type { RoutingState } from 'back/routing';
import type { GlobalDataType } from 'back/types';
import Snackbar from 'back/pages/snackbar';
import styles from './app.less';
import AppTheme from 'common/components/theme/theme';
import { getRoutingState } from 'back/selectors/routing-state';
import { render } from 'back/routing';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { goTo } from 'back/actions/creators';

type Props = {
  routingState: RoutingState,
  goTo: (RoutingState)=>void,
  data: GlobalDataType
};

class BackApp extends React.PureComponent<Props> {
  static displayName = 'BackApp';

  render() {
    const { data, routingState } = this.props;
    const snackbarPosition = { vertical: 'bottom', horizontal: 'right' };
    return (
      <AppTheme htmlFontSize={16}>
        <div className={styles.app}>
          { render(routingState, { routingState, data, goTo }) }
          <Snackbar anchorOrigin={snackbarPosition} />
        </div>
      </AppTheme>
    );
  }
}

const mapStateToProps = mapObject({
  routingState: getRoutingState
});

const actions = { goTo };

const connectRedux = connect(mapStateToProps, actions);
const Connected = connectRedux(BackApp);

export default Connected;
