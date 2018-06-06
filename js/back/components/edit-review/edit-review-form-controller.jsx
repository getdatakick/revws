// @flow
import React from 'react';
import type { ProductInfoType, ReviewType, ReviewFormErrors, CriteriaType, GradingShapeType, LanguagesType } from 'common/types';
import type { Load } from 'back/types';
import EditReviewForm from './edit-review-form';
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getData } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';


type InputProps = {
  productId: number,
  errors: ReviewFormErrors,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  shape: GradingShapeType,
  review: ReviewType,
  onUpdateReview: (ReviewType)=>void,
}

type Props = InputProps & {
  data: any,
  loadData: ({
    [ string ]: Load
  }) => void,
}

class EditReviewFormController extends React.PureComponent<Props> {
  static displayName = 'EditReviewFormController';

  componentDidMount() {
    const { data, loadData, productId } = this.props;
    const key = 'product'+productId;
    if (! data[key]) {
      loadData({
        [ key ]: {
          record: 'productInfo',
          options: {
            id: productId
          }
        }
      });
    }
  }

  render() {
    const { productId, data, ...rest} = this.props;
    const productInfo: ?ProductInfoType = data['product'+productId];
    const usedCriteria = productInfo ? productInfo.criteria : null;
    return (
      <EditReviewForm
        usedCriteria={usedCriteria}
        {...rest} />
    );
  }
}

const mapStateToProps = mapObject({
  data: getData
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(EditReviewFormController);
export default ConnectedComponent;
