// @flow
import type { ComponentType } from 'react';
import type { EntityType } from 'common/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getProducts } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';
import SelectEntity from './select-entity';

const mapStateToProps = mapObject({
  products: getProducts,
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  onSelect: (EntityType, number) => void,
}> = connectRedux(SelectEntity);

export default ConnectedComponent;
