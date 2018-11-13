// @flow
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getEntities } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';
import SelectEntity from './select-entity';
import type { InputProps } from './select-entity';

const mapStateToProps = mapObject({
  entities: getEntities,
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(SelectEntity);

export default ConnectedComponent;
