// @flow
import React from 'react';
import type { GoTo } from 'back/types';
import Tabs, { Tab } from 'material-ui/Tabs';
import { moderationPage, reviewsPage } from 'back/routing';
import styles from './navigation.less';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import Tooltip from 'material-ui/Tooltip';

type Props = {
  selected: string,
  goTo: GoTo
};

class Navigation extends React.PureComponent<Props> {
  static displayName = 'Navigation';

  render() {
    const { selected } = this.props;
    return (
      <div className={styles.root}>
        <div className={styles.left}>
          <Tabs value={selected} onChange={this.onChangeTab}>
            <Tab value='moderation' label="Moderation" />
            <Tab value='reviews' label="Reviews" />
          </Tabs>
        </div>
        <div className={styles.right}>
          { this.renderActions(selected) }
        </div>
      </div>
    );
  }

  renderActions = (value: string) => {
    const { goTo } = this.props;
    if (value === 'reviews') {
      return (
        <Tooltip title={'Create review'}>
          <Button fab mini color="accent" onClick={() => goTo(reviewsPage(true))}>
            <AddIcon />
          </Button>
        </Tooltip>
      );
    }
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
