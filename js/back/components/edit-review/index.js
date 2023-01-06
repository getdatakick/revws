// @flow
import React from 'react';
import type { EntityInfoType, ReviewType, DisplayCriteriaType, CriteriaType, GradingShapeType, LanguagesType } from 'common/types.js';
import type { Load } from 'back/types.js';
import EditReviewDialog from './edit-review-dialog.jsx';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { getData } from 'back/selectors/data.js';
import { loadData } from 'back/actions/creators.js';


type InputProps = {|
  shopName: string,
  allowEmptyTitle: boolean,
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
|}

type Props = InputProps & {|
  data: any,
  loadData: ({
    [ string ]: Load
  }) => void,
|}

class EditReviewDialogController extends React.PureComponent<Props> {
  static displayName: ?string = 'EditReviewDialogController';

  componentDidMount() {
    const { data, loadData, review } = this.props;
    const { entityType, entityId } = review;
    const key = getEntityKey(review);
    if (! data[key]) {
      loadData({
        [ key ]: {
          record: 'record',
          entityType,
          entityId
        }
      });
    }
  }

  render():Node {
    const { data, review, ...rest} = this.props;
    const entityKey = getEntityKey(review);
    const entity: ?EntityInfoType = data[entityKey];
    const usedCriteria = entity ? entity.criteria : null;
    return (
      <EditReviewDialog
        review={review}
        usedCriteria={usedCriteria}
        {...rest} />
    );
  }
}

const getEntityKey = (review: ReviewType): string => {
  const { entityType, entityId } = review;
  const type = entityType.toLowerCase();
  return type + entityId;
};

const mapStateToProps = mapObject({
  data: getData
});

const actions = {
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(EditReviewDialogController);
export default ConnectedComponent;
