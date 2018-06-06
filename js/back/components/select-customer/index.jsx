// @flow
import type { ComponentType } from 'react';
import type { CustomerInfoType } from 'common/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getCustomers } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';
import SelectCustomer from './select-customer';

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
