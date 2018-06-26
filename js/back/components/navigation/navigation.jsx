// @flow
import React from 'react';
import type { GoTo } from 'back/types';
import Tabs, { Tab } from 'material-ui/Tabs';
import { moderationPage, reviewsPage, supportPage } from 'back/routing';
import styles from './navigation.less';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import Tooltip from 'material-ui/Tooltip';
import Badge from 'common/components/badge/badge';

type Props = {
  selected: string,
  goTo: GoTo,
  newVersionAvailable: boolean,
  warnings: number
};

class Navigation extends React.PureComponent<Props> {
  static displayName = 'Navigation';

  render() {
    const { selected, newVersionAvailable, warnings } = this.props;
    return (
      <div className={styles.root}>
        <div className={styles.left}>
          <Tabs value={selected} onChange={this.onChangeTab}>
            <Tab value='moderation' label={__("Moderation")} />
            <Tab value='reviews' label={__("Reviews")} />
            <Tab value='support' label={this.renderSupportLabel(newVersionAvailable, warnings)} />
          </Tabs>
        </div>
        <div className={styles.right}>
          { this.renderActions(selected) }
        </div>
      </div>
    );
  }

  renderSupportLabel = (newVersionAvailable: boolean, warnings: number) => {
    const count = warnings + (newVersionAvailable ? 1 : 0);
    if (count) {
      return (
        <div className={styles.tab}>
          {__("Support")}
          <Badge>{count}</Badge>
        </div>
      );
    }
    return __("Support");
  }

  renderActions = (value: string) => {
    const { goTo } = this.props;
    if (value === 'reviews') {
      return (
        <Tooltip title={__('Create review')}>
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
      case 'support':
        goTo(supportPage());
        break;
    }
  }
}

export default Navigation;
