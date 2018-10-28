// @flow
import React from 'react';
import type { EntityInfoType, NameFormatType, CustomerInfoType, ReviewType, CriteriaType, GradingShapeType, LanguagesType } from 'common/types';
import type { Load } from 'back/types';
import EditReviewDialog from './create-review-dialog';
import type { ComponentType } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getData } from 'back/selectors/data';
import { loadData } from 'back/actions/creators';
import { formatName } from 'common/utils/format';


type InputProps = {
  nameFormat: NameFormatType,
  allowEmptyReview: boolean,
  shape: GradingShapeType,
  shapeSize: number,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
}

type Props = InputProps & {
  data: any,
  loadData: ({
    [ string ]: Load
  }) => void,
}

type State = {
  productId: ?number,
  review: ?ReviewType
}

class EditReviewDialogController extends React.PureComponent<Props, State> {
  static displayName = 'EditReviewDialogController';

  state = {
    productId: null,
    review: null
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextState.productId) {
      const productId = nextState.productId;
      const { data, loadData } = this.props;
      const key = 'product'+productId;
      if (! data[key]) {
        loadData({
          [ key ]: {
            record: 'product',
            options: {
              id: productId
            }
          }
        });
      }
    }
  }

  render() {
    const { data, ...rest} = this.props;
    const { productId, review } = this.state;
    const productInfo: ?EntityInfoType = productId ? data['product'+productId] : null;
    const usedCriteria = productInfo ? productInfo.criteria : null;
    return (
      <EditReviewDialog
        productId={productId}
        review={review}
        usedCriteria={usedCriteria}
        onSetCustomer={this.setCustomer}
        onSetProduct={(productId) => this.setState({ productId })}
        onUpdateReview={(review) => this.setState({ review })}
        {...rest} />
    );
  }

  setCustomer = (customerInfo: CustomerInfoType) => {
    const productId = this.state.productId || 0;
    const review: ReviewType = {
      id: -1,
      language: this.props.language,
      entityType: 'PRODUCT',
      entityId: productId,
      authorType: 'customer',
      authorId: customerInfo.id,
      customer: null,
      product: null,
      email: customerInfo.email,
      grades: {},
      images: [],
      reply: null,
      displayName: formatName(customerInfo.firstName, customerInfo.lastName, customerInfo.pseudonym, this.props.nameFormat),
      title: '',
      content: null,
      underReview: true,
      deleted: false,
      verifiedBuyer: true,
      date: new Date(),
      canVote: false,
      canReport: false,
      canDelete: true,
      canEdit: true
    };
    this.setState({ review });
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
