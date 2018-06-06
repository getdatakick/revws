// @flow
import type { ComponentType } from 'react';
import type { LanguagesType } from 'common/types';
import { connect } from 'react-redux';
import { mapObject } from 'common/utils/redux';
import { getFullCriteria } from 'back/selectors/criteria';
import { getProducts, getCategories } from 'back/selectors/data';
import { deleteCriterion, saveCriterion, loadData } from 'back/actions/creators';
import CriteriaSection from './criteria-section';

const mapStateToProps = mapObject({
  criteria: getFullCriteria,
  products: getProducts,
  categories: getCategories,
});

const actions = {
  onSaveCriterion: saveCriterion,
  onDeleteCriterion: deleteCriterion,
  loadData
};

const connectRedux = connect(mapStateToProps, actions);
const ConnectedComponent: ComponentType<{
  language: number,
  languages: LanguagesType
}> = connectRedux(CriteriaSection);

export default ConnectedComponent;
