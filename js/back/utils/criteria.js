// @flow
import { map } from 'ramda';
import type { FullCriteria, FullCriterion } from 'back/types.js';
import type { CriteriaType, CriterionType } from 'common/types.js';

const toCriterion = (language: number) => (crit: FullCriterion): CriterionType => ({
  id: crit.id,
  label: crit.label[language]
});

export const convertCriteria = (language: number, fullCriteria: FullCriteria): CriteriaType => map(toCriterion(language), fullCriteria);
