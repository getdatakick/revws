// @flow
import type { ComponentType } from 'react';
import type { CustomerInfoType } from 'common/types.js';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { getCustomers } from 'back/selectors/data.js';
import { loadData } from 'back/actions/creators.js';
import SelectCustomer from './select-customer.jsx';

const mapStateToProps = mapObject({
  customers: getCustomers,
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  onSelect: (CustomerInfoType) => void,
}> = connectRedux(SelectCustomer);

export default ConnectedComponent;
