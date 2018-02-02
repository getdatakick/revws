// @flow
import React from 'react';
import type { GoTo } from 'back/types';
import Tabs, { Tab } from 'material-ui/Tabs';
import { moderationPage, reviewsPage } from 'back/routing';
import styles from './navigation.less';

type Props = {
  selected: string,
  goTo: GoTo,
};

class Navigation extends React.PureComponent<Props> {
  static displayName = 'Navigation';

  render() {
    const { selected } = this.props;
    return (
      <div className={styles.root}>
        <Tabs value={selected} onChange={this.onChangeTab}>
          <Tab value='moderation' label="Moderation" />
          <Tab value='reviews' label="Reviews" />
        </Tabs>
      </div>
    );
  }

  onChangeTab = (e: any, value: string) => {
    const { goTo } = this.props;
    switch (value) {
      case 'moderation':
        goTo(moderationPage());
        break;
      case 'reviews':
        goTo(reviewsPage());
        break;
    }
  }
}

export default Navigation;
