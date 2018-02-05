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

type InputProps = {
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
  value: number
}


class FullWidthTabs extends React.PureComponent<Props, State> {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, selectedProducts, selectedCategories, products, categories, onSetProducts, onSetCategories } = this.props;
    const value = this.state.value;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="accent"
            fullWidth >
            <Tab label={__("Categories")} />
            <Tab label={__("Products")} />
          </Tabs>
        </AppBar>
        { value === 0 ?
          this.renderTab(categories, selectedCategories, onSetCategories) :
          this.renderTab(products, selectedProducts, onSetProducts) }
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

const Component: ComponentType<InputProps> = withStyles(styles)(FullWidthTabs);
export default Component;
