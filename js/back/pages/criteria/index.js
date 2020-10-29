// @flow
import type { ComponentType } from 'react';
import type { KeyValue } from 'common/types';
import type { State } from 'back/reducer';
import type { Load, GlobalDataType, FullCriteria, FullCriterion } from 'back/types';
import { connect } from 'react-redux';
import { getFullCriteria } from 'back/selectors/criteria';
import { getProducts, getCategories } from 'back/selectors/data';
import { deleteCriterion, saveCriterion, loadData } from 'back/actions/creators';
import CriteriaSection from './criteria';
import type { Props } from './criteria';


type OwnProps = {|
  criteria: FullCriteria,
  products: ?KeyValue,
  categories: ?KeyValue,
|}

type Actions = {|
  loadData: ({
    [ string ]: Load
  }) => void,
  onSaveCriterion: (FullCriterion) => void,
  onDeleteCriterion: (number) => void
|}

type PassedProps = {|
  data: GlobalDataType
|}

const mapStateToProps = (state: State): OwnProps => ({
  criteria: getFullCriteria(state),
  products: getProducts(state),
  categories: getCategories(state),
});

const actions = {
  onSaveCriterion: saveCriterion,
  onDeleteCriterion: deleteCriterion,
  loadData
};

const merge = (props: OwnProps, actions: Actions, passed: PassedProps):Props => ({
  ...props,
  ...actions,
  language: passed.data.language,
  languages: passed.data.languages
});

const connectRedux = connect(mapStateToProps, actions, merge);
const ConnectedComponent: ComponentType<PassedProps> = connectRedux(CriteriaSection);

export default ConnectedComponent;
