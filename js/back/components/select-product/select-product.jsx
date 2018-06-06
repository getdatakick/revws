// @flow
import React from 'react';
import type { KeyValue } from 'common/types';
import type { Load } from 'back/types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import validator from 'validator';
import styles from './select-product.less';

type InputProps = {
  onSelect: (number) => void
}

type Props = InputProps & {
  products: ?KeyValue,
  loadData: ({
    [ string ]: Load
  }) => void,
};

type State = {
  products: Array<[number, string]>,
  text: string
}

class SelectProduct extends React.PureComponent<Props, State> {
  static displayName = 'SelectProduct';

  state = {
    products: [],
    text: ''
  }

  componentDidMount() {
    const { products, loadData } = this.props;
    if (! products) {
      loadData({
        products: {
          record: 'products',
          options: 'all'
        }
      });
    } else {
      this.filterProducts(this.state.text, products);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextProps.products) {
      const products = nextProps.products;
      if (! this.props.products) {
        this.filterProducts(nextState.text, products);
      } else if (this.state.text != nextState.text) {
        this.filterProducts(nextState.text, products);
      }
    }
  }

  render() {
    const { text } = this.state;
    const hasProducts = !!this.props.products;
    return (
      <div>
        <TextField
          label={__("Search products")}
          placeholder={__("Search products")}
          value={text}
          onChange={e => this.setState({text: e.target.value})}
          fullWidth />
        <div className={styles.suggest}>
          { hasProducts ? this.renderProducts() : this.renderPlaceholder() }
        </div>
      </div>
    );
  }

  renderProducts = () => {
    const products = this.state.products;
    return products.length == 0 ? (
      <div className={styles.center}>
        <div>
          {__('Nothing found')}
        </div>
      </div>
    ) : (
      <List>
        { products.map(this.renderResult) }
      </List>
    );
  }

  renderPlaceholder = () => (
    ''
  );

  renderResult = (pair: [number, string]) => {
    const [ id, name ] = pair;
    return (
      <ListItem key={id} button onClick={() => this.props.onSelect(id)}>
        <div className={styles.number}>{id}</div>
        <ListItemText primary={name} />
      </ListItem>
    );
  }

  filterProducts = (text: string, input: KeyValue) => {
    const products: Array<[number, string]> = [];
    text = text.toLowerCase();
    const isNumber = validator.isNumeric(text);
    for (let key in input) {
      if (input.hasOwnProperty(key)) {
        const id = parseInt(key, 10);
        const label: string = (input[id] || '').toLowerCase();
        const test = isNumber ? key : label;
        if (test.indexOf(text) > -1) {
          products.push([id, label]);
          if (products.length >= 8) {
            break;
          }
        }
      }
    }
    this.setState({ products });
  }
}

export default SelectProduct;
