// @flow
import React from 'react';
import type { GoTo, RoutingState, GlobalDataType } from 'back/types';
import Snackbar from 'back/pages/snackbar';
import styles from './app.less';
import AppTheme from 'common/components/theme/theme';
import { getRoutingState } from 'back/selectors/routing-state';
import { isNewVersionAvailable, shouldReview } from 'back/selectors/account';
import { render } from 'back/routing';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { goTo } from 'back/actions/creators';
import Navigation from 'back/components/navigation/navigation';
import Registration from 'back/components/registration';

type Props = {
  routingState: RoutingState,
  newVersionAvailable: boolean,
  shouldReview: boolean,
  goTo: GoTo,
  data: GlobalDataType
};

class BackApp extends React.PureComponent<Props> {
  static displayName: ?string = 'BackApp';

  render() {
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

  renderNavigation = (routingState: RoutingState) => {
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
