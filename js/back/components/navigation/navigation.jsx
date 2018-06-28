// @flow
import React from 'react';
import type { GoTo, RoutingState } from 'back/types';
import Tabs, { Tab } from 'material-ui/Tabs';
import { moderationPage, reviewsPage, supportPage } from 'back/routing';
import styles from './navigation.less';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui-icons/Add';
import ListIcon from 'material-ui-icons/List';
import ImportExportIcon from 'material-ui-icons/ImportExport';
import Tooltip from 'material-ui/Tooltip';
import Badge from 'common/components/badge/badge';

type Props = {
  routingState: RoutingState,
  goTo: GoTo,
  newVersionAvailable: boolean,
  warnings: number
};

class Navigation extends React.PureComponent<Props> {
  static displayName = 'Navigation';

  render() {
    const { routingState, newVersionAvailable, warnings } = this.props;
    const selected = routingState.type;
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
          { this.renderActions(routingState) }
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

  renderActions = (routingState: RoutingState) => {
    const { goTo } = this.props;
    const ret = [];
    if (routingState.type === 'reviews') {
      if (routingState.subpage === 'data') {
        ret.push(
          <Tooltip key='importexport' title={__('Show review list')}>
            <IconButton onClick={() => goTo(reviewsPage('list'))}>
              <ListIcon />
            </IconButton>
          </Tooltip>
        );
      } else {
        ret.push(
          <Tooltip key='importexport' title={__('Import and export reviews')}>
            <IconButton onClick={() => goTo(reviewsPage('data'))}>
              <ImportExportIcon />
            </IconButton>
          </Tooltip>
        );
        ret.push(
          <Tooltip key='create' title={__('Create review')}>
            <Button fab mini color="accent" onClick={() => goTo(reviewsPage('create'))}>
              <AddIcon />
            </Button>
          </Tooltip>
        );
      }
    }
    return ret;
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
