// @flow

import type { KeyValue } from 'common/types';
import type { ComponentType } from 'react';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import SingleTab from './tab';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper
  },
  tab: {
    paddingTop: 20
  },
  checkbox: {
    height: 24
  }
});

type TabKey = 'products' | 'categories';

type InputProps = {
  selectCategories: boolean,
  selectProducts: boolean,
  products: ?KeyValue,
  categories: ?KeyValue,
  selectedProducts: Array<number>,
  selectedCategories: Array<number>,
  onSetProducts: (Array<number>) => void,
  onSetCategories: (Array<number>) => void,
}

type Props = InputProps & {
  classes: any,
}

type State = {
  tab: TabKey
}


class FullWidthTabs extends React.PureComponent<Props, State> {

  state: State = {
    tab: getInitialTab(this.props)
  };

  handleChange = (event, tab) => {
    this.setState({ tab });
  };

  render() {
    const { classes, selectProducts, selectCategories, selectedProducts, selectedCategories, products, categories, onSetProducts, onSetCategories } = this.props;
    const tab = this.state.tab;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs
            value={tab}
            onChange={this.handleChange}
            indicatorColor="accent"
            fullWidth >
            { selectCategories && <Tab value="categories" label={__("Categories")} /> }
            { selectProducts && <Tab value="products" label={__("Products")} /> }
          </Tabs>
        </AppBar>
        { tab === 'categories' && this.renderTab(categories, selectedCategories, onSetCategories) }
        { tab === 'products' && this.renderTab(products, selectedProducts, onSetProducts) }
      </div>
    );
  }

  renderTab = (values: ?KeyValue, selectedValues: Array<number>, action: (Array<number>)=>void) => {
    return (
      <SingleTab
        classes={this.props.classes}
        values={values}
        selectedValues={selectedValues}
        onChange={action} />
    );
  }
}

const getInitialTab = (props: Props): TabKey => {
  if (props.selectCategories) {
    return 'categories';
  }
  if (props.selectProducts) {
    return 'products';
  }
  throw new Error('Invariant');
};

const Component: ComponentType<InputProps> = withStyles(styles)(FullWidthTabs);
export default Component;
