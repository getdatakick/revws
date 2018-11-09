// @flow

import React from 'react';
import { filter } from 'ramda';
import CriteriaSection from './criteria-section';
import Section from 'back/components/section/section';
import type { EntityType, LanguagesType, KeyValue } from 'common/types';
import type { Load, FullCriteria, FullCriterion } from 'back/types';

export type Props = {
  criteria: FullCriteria,
  products: ?KeyValue,
  categories: ?KeyValue,
  language: number,
  languages: LanguagesType,
  loadData: ({
    [ string ]: Load
  }) => void,
  onSaveCriterion: (FullCriterion) => void,
  onDeleteCriterion: (number) => void,
};

class CriteriaPage extends React.PureComponent<Props> {
  static displayName = 'CriteriaPage';

  render() {
    const { criteria, ...rest  } = this.props;
    return (
      <div>
        <Section id='products' label={__('Products criteria')}>
          <CriteriaSection
            entityType='product'
            criteria={getCriteria('product', criteria)}
            selectProducts={true}
            selectCategories={true}
            {...rest} />
        </Section>
      </div>
    );
  }
}

const getCriteria = (type: EntityType, criteria: FullCriteria): FullCriteria => filter((crit: FullCriterion) => crit.entityType === type, criteria);

export default CriteriaPage;
