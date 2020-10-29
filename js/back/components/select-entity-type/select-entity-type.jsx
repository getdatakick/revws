// @flow
import type {Node} from "React";import React from 'react';
import type { EntityType } from 'common/types';
import { sortBy, prop, toPairs } from 'ramda';
import List, { ListItem, ListItemText } from 'material-ui/List';

export type Props = {
  entityTypes: { [ EntityType ]: string },
  onSelect: (EntityType) => void
}

class SelectEntityType extends React.PureComponent<Props> {
  static displayName:?string = 'SelectEntityType';

  render: (() => Node) = () => {
    const { entityTypes } = this.props;
    const pairs = sortBy(prop(1), toPairs(entityTypes));
    return (
      <List>
        { pairs.map(this.renderEntityType) }
      </List>
    );
  }

  renderEntityType: ((pair: [EntityType, string]) => Node) = (pair: [EntityType, string]) => {
    const [ type, name ] = pair;
    return (
      <ListItem key={type} button onClick={() => this.props.onSelect(type)}>
        <ListItemText primary={name} />
      </ListItem>
    );
  }
}

export default SelectEntityType;
