// @flow
import React from 'react';
import type { Node } from 'react';
import type { GoTo, RoutingState, GlobalDataType } from 'back/types.js';
import Snackbar from 'back/pages/snackbar/index.js';
import styles from './app.less';
import AppTheme from 'common/components/theme/theme.jsx';
import { getRoutingState } from 'back/selectors/routing-state.js';
import { isNewVersionAvailable, shouldReview } from 'back/selectors/account.js';
import { render } from 'back/routing/index.js';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { goTo } from 'back/actions/creators.js';
import Navigation from 'back/components/navigation/navigation.jsx';
import Registration from 'back/components/registration/index.js';

type Props = {
  routingState: RoutingState,
  newVersionAvailable: boolean,
  shouldReview: boolean,
  goTo: GoTo,
  data: GlobalDataType
};

class BackApp extends React.PureComponent<Props> {
  static displayName: ?string = 'BackApp.js';

  render(): Node {
    const { data, routingState, goTo } = this.props;
    const snackbarPosition = { vertical: 'bottom', horizontal: 'right' };
    return (
      <AppTheme>
        <div className={styles.app}>
          { this.renderNavigation(routingState) }
          { render(routingState, { ...routingState, data, goTo }) }
          <Snackbar anchorOrigin={snackbarPosition} />
          <Registration isRtl={data.isRtl} />
        </div>
      </AppTheme>
    );
  }

  renderNavigation = (routingState: RoutingState): Node => {
    if (routingState.showNavigation) {
      const { shouldReview, newVersionAvailable, data } = this.props;
      const warnings = data.warnings;
      return (
        <Navigation
          newVersionAvailable={newVersionAvailable}
          shouldReview={shouldReview}
          routingState={routingState}
          warnings={warnings ? warnings.length : 0}
          goTo={this.props.goTo}
        />
      );
    }
  }
}

const mapStateToProps = mapObject({
  routingState: getRoutingState,
  newVersionAvailable: isNewVersionAvailable,
  shouldReview: shouldReview,
});

const actions = { goTo };

const connectRedux = connect(mapStateToProps, actions);
const Connected: any = connectRedux(BackApp);

export default Connected;
