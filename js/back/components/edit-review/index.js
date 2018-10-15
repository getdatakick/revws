// @flow
import React from 'react';
import type { ProductInfoType, ReviewType, DisplayCriteriaType, CriteriaType, GradingShapeType, LanguagesType } from 'common/types';
import type { Load } from 'back/types';
import EditReviewDialog from './edit-review-dialog';
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getData } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';


type InputProps = {
  shopName: string,
  allowEmptyReviews: boolean,
  review: ReviewType,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  dateFormat: string,
  displayCriteria: DisplayCriteriaType,
  shape: GradingShapeType,
  shapeSize: number,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type Props = InputProps & {
  data: any,
  loadData: ({
    [ string ]: Load
  }) => void,
}

class EditReviewDialogController extends React.PureComponent<Props> {
  static displayName = 'EditReviewDialogController';

  componentDidMount() {
    const { data, loadData, review } = this.props;
    const productId = review.productId;
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
    const { data, review, ...rest} = this.props;
    const productId = review.productId;
    const productInfo: ?ProductInfoType = data['product'+productId];
    const usedCriteria = productInfo ? productInfo.criteria : null;
    return (
      <EditReviewDialog
        review={review}
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
const ConnectedComponent: ComponentType<InputProps> = connectRedux(EditReviewDialogController);
export default ConnectedComponent;
