// @flow
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getProducts } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';
import SelectProduct from './select-product';

const mapStateToProps = mapObject({
  products: getProducts,
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  onSelect: (number) => void,
}> = connectRedux(SelectProduct);

export default ConnectedComponent;
