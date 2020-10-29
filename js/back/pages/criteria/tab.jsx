// @flow

import type {Node, Element} from "React";import type { KeyValue } from 'common/types';
import { filter, indexOf, remove, append, contains, map, toPairs } from 'ramda';
import React from 'react';
import List, { ListItem, ListItemText, } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';

type Props = {
  classes: any,
  values: ?KeyValue,
  selectedValues: Array<number>,
  onChange: (Array<number>)=>void
}

type State = {
  search: string
}

class Tab extends React.PureComponent<Props, State> {
  state: State = {
    search: ''
  };

  render(): Element<"div"> {
    const { classes, values } = this.props;
    const { search } = this.state;
    return (
      <div className={classes.tab}>
        <div className={classes.search}>
          <TextField
            label={__('Search')}
            placeholder={__('Search')}
            onChange={e => this.setState({ search: e.target.value })}
            value={search}
          />
        </div>
        <List dense={true}>
          { values ? map(this.renderItem, filter(this.filter, toPairs(values))) : (
            <ListItem button>
              <ListItemText primary={__('Loading...')} />
            </ListItem>
          )}
        </List>
      </div>
    );
  }

  renderItem: ((item: [string, string]) => Node) = (item: [string, string]) => {
    const { selectedValues } = this.props;
    const key = parseInt(item[0], 10);
    const label = item[1];
    const checked = contains(key, selectedValues);
    return (
      <ListItem key={key} button onClick={e => this.toggle(key)}>
        <Checkbox
          className={this.props.classes.checkbox}
          checked={checked}
          tabIndex={-1}
          disableRipple />
        <ListItemText primary={label} />
      </ListItem>
    );
  }

  filter: ((item: [string, string]) => any | boolean) = (item: [string, string]) => {
    if (this.state.search) {
      const searchLC = this.state.search.toLowerCase();
      return contains(searchLC, item[1].toLowerCase());
    }
    return true;
  }

  toggle: ((key: number) => void) = (key: number) => {
    const { selectedValues, onChange } = this.props;
    const index = indexOf(key, selectedValues);
    const values = index == -1 ? append(key, selectedValues) : remove(index, 1, selectedValues);
    onChange(values);
  }

}

export default Tab;
