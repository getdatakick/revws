// @flow
import type { RouteDefinition } from 'back/types';
import Moderation from 'back/pages/moderation';

export type ModerationPage = {
  type: 'moderation',
  showNavigation: boolean
}

const toUrl = (moderation: ModerationPage) => {
  return '/moderation';
};

const toState = (url: string): ?ModerationPage => {
  if (url === '/moderation') {
    return moderationPage();
  }
};

export const moderationPage = ():ModerationPage => ({
  type: 'moderation',
  showNavigation: true
});

export const moderationRoute: RouteDefinition<ModerationPage> = {
  toUrl,
  toState,
  component: Moderation
};
