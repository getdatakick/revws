// @flow
import type { ComponentType } from 'react';
import type { State } from 'back/reducer/index.js';
import type { LoadPagination } from 'back/types.js';
import type { InputProps } from './controller.jsx';
import { connect } from 'react-redux';
import { saveReview, loadData, approveReview, deleteReview, deletePermReview, undeleteReview } from 'back/actions/creators.js';
import Controller from './controller.jsx';

const mapStateToProps = (state: State) => ({
  data: state.data
});

const actions = {
  approveReview,
  deleteReview,
  deletePermReview,
  undeleteReview,
  saveReview,
  loadData: (key: string, pagination: LoadPagination) => loadData({
    [ key ]: {
      record: 'reviews',
      pagination
    }
  })
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(Controller);

export default ConnectedComponent;
