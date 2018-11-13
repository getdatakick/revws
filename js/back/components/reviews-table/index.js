// @flow
import type { ComponentType } from 'react';
import type { LoadPagination } from 'back/types';
import type { InputProps } from './controller';
import { connect } from 'react-redux';
import { saveReview, loadData, approveReview, deleteReview, deletePermReview, undeleteReview } from 'back/actions/creators';
import Controller from './controller';

const mapStateToProps = (state) => ({
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
