// @flow
import type {Node, Element} from "React";import React from 'react';
import type { EntityType, KeyValue } from 'common/types';
import type { Load } from 'back/types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import validator from 'validator';
import styles from './select-entity.less';

export type InputProps = {
  entityName: string,
  entityType: EntityType,
  onSelect: (number) => void
}

type Props = InputProps & {
  entities: ?KeyValue,
  loadData: ({
    [ string ]: Load
  }) => void,
};

type State = {
  entities: Array<[number, string]>,
  text: string
}

class SelectEntity extends React.PureComponent<Props, State> {
  static displayName: ?string = 'SelectEntity';

  state: State = {
    entities: [],
    text: ''
  }

  componentDidMount() {
    const { entityType, entities, loadData } = this.props;
    if (! entities) {
      loadData({
        entities: {
          record: 'entities',
          entityType
        }
      });
    } else {
      this.filterEntities(this.state.text, entities);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextProps.entities) {
      const entities = nextProps.entities;
      if (! this.props.entities) {
        this.filterEntities(nextState.text, entities);
      } else if (this.state.text != nextState.text) {
        this.filterEntities(nextState.text, entities);
      }
    }
  }

  render(): Element<"div"> {
    const { text } = this.state;
    const { entities, entityName } = this.props;
    const hasEntities = !!entities;
    return (
      <div>
        <TextField
          label={__("Search %s", entityName)}
          placeholder={__("Search %s", entityName)}
          value={text}
          onChange={e => this.setState({text: e.target.value})}
          fullWidth />
        <div className={styles.suggest}>
          { hasEntities ? this.renderEntities() : this.renderPlaceholder() }
        </div>
      </div>
    );
  }

  renderEntities: (() => Node | Element<"div">) = () => {
    const entities = this.state.entities;
    return entities.length == 0 ? (
      <div className={styles.center}>
        <div>
          {__('Nothing found')}
        </div>
      </div>
    ) : (
      <List>
        { entities.map(this.renderResult) }
      </List>
    );
  }

  renderPlaceholder: (() => string) = () => (
    ''
  );

  renderResult: ((pair: [number, string]) => Node) = (pair: [number, string]) => {
    const [ id, name ] = pair;
    return (
      <ListItem key={id} button onClick={() => this.props.onSelect(id)}>
        <div className={styles.number}>{id}</div>
        <ListItemText primary={name} />
      </ListItem>
    );
  }

  filterEntities: ((text: string, input: KeyValue) => void) = (text: string, input: KeyValue) => {
    const entities: Array<[number, string]> = [];
    text = text.toLowerCase();
    const isNumber = validator.isNumeric(text);
    for (let key in input) {
      if (input.hasOwnProperty(key)) {
        const id = parseInt(key, 10);
        const label: string = (input[id] || '').toLowerCase();
        const test = isNumber ? key : label;
        if (test.indexOf(text) > -1) {
          entities.push([id, label]);
          if (entities.length >= 8) {
            break;
          }
        }
      }
    }
    this.setState({ entities });
  }
}

export default SelectEntity;
