// @flow
import type { RouteDefinition } from 'back/types.js';
import Support from 'back/pages/support/index.js';

export type SupportPage = {
  type: 'support',
  showNavigation: boolean
}

const toUrl = (support: SupportPage) => {
  return '/support';
};

const toState = (url: string): ?SupportPage => {
  if (url === '/support') {
    return supportPage();
  }
};

export const supportPage = ():SupportPage => ({
  type: 'support',
  showNavigation: true
});

export const supportRoute: RouteDefinition<SupportPage> = {
  toUrl,
  toState,
  component: Support
};
