// @flow
import React from 'react';
import type { GoTo, RoutingState, GlobalDataType } from 'back/types';
import Snackbar from 'back/pages/snackbar';
import styles from './app.less';
import AppTheme from 'common/components/theme/theme';
import { getRoutingState } from 'back/selectors/routing-state';
import { render } from 'back/routing';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { goTo } from 'back/actions/creators';
import Navigation from 'back/components/navigation/navigation';

type Props = {
  routingState: RoutingState,
  goTo: GoTo,
  data: GlobalDataType
};

class BackApp extends React.PureComponent<Props> {
  static displayName = 'BackApp';

  render() {
    const { data, routingState, goTo } = this.props;
    const snackbarPosition = { vertical: 'bottom', horizontal: 'right' };
    return (
      <AppTheme htmlFontSize={16}>
        <div className={styles.app}>
          { this.renderNavigation(routingState) }
          { render(routingState, { ...routingState, data, goTo }) }
          <Snackbar anchorOrigin={snackbarPosition} />
        </div>
      </AppTheme>
    );
  }

  renderNavigation = (routingState: RoutingState) => {
    if (routingState.showNavigation) {
      return (
        <Navigation
          selected={routingState.type}
          goTo={this.props.goTo}
        />
      );
    }
  }
}

const mapStateToProps = mapObject({
  routingState: getRoutingState
});

const actions = { goTo };

const connectRedux = connect(mapStateToProps, actions);
const Connected = connectRedux(BackApp);

export default Connected;
