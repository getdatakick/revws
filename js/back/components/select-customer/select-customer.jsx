// @flow
import React from 'react';
import type { CustomerInfoType } from 'common/types';
import type { Load } from 'back/types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import validator from 'validator';
import styles from '../select-product/select-product.less';

type CustomersType = {
  [ number ]: CustomerInfoType
};

type InputProps = {
  onSelect: (CustomerInfoType) => void
}

type Props = InputProps & {
  customers: ?CustomersType,
  loadData: ({
    [ string ]: Load
  }) => void,
};

type State = {
  customers: Array<CustomerInfoType>,
  text: string
}

class SelectProduct extends React.PureComponent<Props, State> {
  static displayName = 'SelectProduct';

  state = {
    customers: [],
    text: ''
  }

  componentDidMount() {
    const { customers, loadData } = this.props;
    if (! customers) {
      loadData({
        customers: {
          record: 'customers',
          options: 'all'
        }
      });
    } else {
      this.filterCustomers(this.state.text, customers);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextProps.customers) {
      const customers = nextProps.customers;
      if (! this.props.customers) {
        this.filterCustomers(nextState.text, customers);
      } else if (this.state.text != nextState.text) {
        this.filterCustomers(nextState.text, customers);
      }
    }
  }

  render() {
    const { text } = this.state;
    const hasCustomers = !!this.props.customers;
    return (
      <div>
        <TextField
          label={__("Search customers")}
          placeholder={__("Search customers")}
          value={text}
          onChange={e => this.setState({text: e.target.value})}
          fullWidth />
        <div className={styles.suggest}>
          { hasCustomers ? this.renderCustomers() : this.renderPlaceholder() }
        </div>
      </div>
    );
  }

  renderCustomers = () => {
    const customers = this.state.customers;
    return customers.length == 0 ? (
      <div className={styles.center}>
        <div>
          {__('Nothing found')}
        </div>
      </div>
    ) : (
      <List>
        { customers.map(this.renderResult) }
      </List>
    );
  }

  renderPlaceholder = () => (
    ''
  );

  renderResult = (customer: CustomerInfoType) => {
    return (
      <ListItem key={customer.id} button onClick={() => this.props.onSelect(customer)}>
        <div className={styles.number}>{customer.id}</div>
        <ListItemText primary={customer.firstName + ' '+customer.lastName} />
        <div className={styles.email}>{customer.email}</div>
      </ListItem>
    );
  }

  filterCustomers = (text: string, input: CustomersType) => {
    const customers: Array<CustomerInfoType> = [];
    text = text.toLowerCase();
    const isNumber = validator.isNumeric(text);
    for (let key in input) {
      if (input.hasOwnProperty(key)) {
        const id = parseInt(key, 10);
        const customer: CustomerInfoType = input[id];
        const test = isNumber ? key : (customer.firstName + ' '+customer.lastName + ' ' + customer.email).toLowerCase();
        if (test.indexOf(text) > -1) {
          customers.push(customer);
          if (customers.length >= 8) {
            break;
          }
        }
      }
    }
    this.setState({ customers });
  }
}

export default SelectProduct;
