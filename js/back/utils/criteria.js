// @flow
import { map } from 'ramda';
import type { FullCriteria, FullCriterion } from 'back/types';
import type { CriteriaType, CriterionType } from 'common/types';

const toCriterion = (language: number) => (crit: FullCriterion): CriterionType => ({
  id: crit.id,
  label: crit.label[language]
});

const getCriteria = (language: number, fullCriteria: FullCriteria): CriteriaType => map(toCriterion(language), fullCriteria);

export const mergeCriteria = (props: any, actions: any, passed: any) => {
  const { fullCriteria, ...rest } = props;
  const language = passed.data.language;
  if (! fullCriteria) {
    throw new Error('Full criteria not found');
  }
  if (! language) {
    throw new Error('Language not found');
  }
  return {
    ...rest,
    criteria: getCriteria(language, fullCriteria),
    ...actions,
    ...passed,
  };
};
