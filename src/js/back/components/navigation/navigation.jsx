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
  newVersionAvailable: boolean
};

class Navigation extends React.PureComponent<Props> {
  static displayName = 'Navigation';

  render() {
    const { selected, newVersionAvailable } = this.props;
    let support = __("Support");
    if (newVersionAvailable) {
      support = (
        <div className={styles.tab}>
          {support}
          <Badge>1</Badge>
        </div>
      );
    }
    return (
      <div className={styles.root}>
        <div className={styles.left}>
          <Tabs value={selected} onChange={this.onChangeTab}>
            <Tab value='moderation' label={__("Moderation")} />
            <Tab value='reviews' label={__("Reviews")} />
            <Tab value='support' label={support} />
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
