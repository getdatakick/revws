// @flow
import React from 'react';
import type { EntityType, EntityTypes, EntityInfoType, NameFormatType, CustomerInfoType, ReviewType, CriteriaType, GradingShapeType, LanguagesType } from 'common/types.js';
import type { Load } from 'back/types.js';
import CreateReviewDialog from './create-review-dialog.jsx';
import type { ComponentType, Node } from 'react';
import { keys } from 'ramda';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux.js';
import { getData } from 'back/selectors/data.js';
import { loadData } from 'back/actions/creators.js';
import { formatName } from 'common/utils/format.js';

type InputProps = {|
  entityTypes: EntityTypes,
  nameFormat: NameFormatType,
  allowEmptyTitle: boolean,
  allowEmptyReview: boolean,
  shape: GradingShapeType,
  shapeSize: number,
  language: number,
  languages: LanguagesType,
  criteria: CriteriaType,
  onSave: (ReviewType)=>void,
  onClose: ()=>void
|}

type Props = InputProps & {|
  data: any,
  loadData: ({
    [ string ]: Load
  }) => void,
|}

type State = {
  entityType: ?EntityType,
  entityId: ?number,
  review: ?ReviewType
}

class EditReviewDialogController extends React.PureComponent<Props, State> {
  static displayName: ?string = 'EditReviewDialogController';

  state: State = {
    entityType: getEntityType(this.props.entityTypes),
    entityId: null,
    review: null
  }

  UNSAFE_componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextState.entityType && nextState.entityId) {
      const { entityType, entityId } = nextState;
      const { data, loadData } = this.props;
      const key = entityType + entityId;
      if (! data[key]) {
        const load: Load = {
          record: 'entity',
          entityType,
          entityId
        };
        loadData({ [ key ]: load });
      }
    }
  }

  render(): Node {
    const { data, entityTypes, ...rest} = this.props;
    const { entityType, entityId, review } = this.state;
    let entity: ?EntityInfoType = null;
    if (entityType && entityId) {
      entity = data[entityType + entityId];
    }
    const usedCriteria = entity ? entity.criteria : null;
    return (
      <CreateReviewDialog
        entityTypes={entityTypes}
        entityType={entityType}
        entityId={entityId}
        review={review}
        usedCriteria={usedCriteria}
        onSetCustomer={this.setCustomer}
        onSetEntityType={(entityType) => this.setState({ entityType })}
        onSetEntity={(entityId) => this.setState({ entityId })}
        onUpdateReview={(review) => this.setState({ review })}
        {...rest} />
    );
  }

  setCustomer = (customerInfo: CustomerInfoType) => {
    const { entityType, entityId } = this.state;
    if (entityType && entityId) {
      const review: ReviewType = {
        id: -1,
        language: this.props.language,
        entityType,
        entityId,
        entity: null,
        authorType: 'customer',
        authorId: customerInfo.id,
        customer: null,
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
}

const getEntityType = (entityTypes: EntityTypes) => {
  const k = keys(entityTypes);
  if (k.length === 1) {
    return k[0];
  }
  return null;
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
