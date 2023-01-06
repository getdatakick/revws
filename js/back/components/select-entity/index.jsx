// @flow
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { getEntities } from 'back/selectors/data.js';
import { loadData } from 'back/actions/creators.js';
import SelectEntity from './select-entity.jsx';
import type { InputProps } from './select-entity.jsx';

const mapStateToProps = mapObject({
  entities: getEntities,
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(SelectEntity);

export default ConnectedComponent;
