// @flow
import type { RouteDefinition } from 'back/types';
import Criteria from 'back/pages/criteria';

export type CriteriaPage = {
  type: 'criteria',
  showNavigation: boolean
}

const toUrl = (settings: CriteriaPage) => {
  return '/criteria';
};

const toState = (url: string): ?CriteriaPage => {
  if (url === '/criteria') {
    return criteriaPage();
  }
};

export const criteriaPage = ():CriteriaPage => ({
  type: 'criteria',
  showNavigation: true
});

export const criteriaRoute: RouteDefinition<CriteriaPage> = {
  toUrl,
  toState,
  component: Criteria
};
