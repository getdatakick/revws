// @flow
import type { RouteDefinition } from 'back/types';
import Settings from 'back/pages/settings';

export type SettingsPage = {
  type: 'settings',
  showNavigation: boolean
}

const toUrl = (settings: SettingsPage) => {
  return '/settings';
};

const toState = (url: string): ?SettingsPage => {
  if (url === '/settings') {
    return settingsPage();
  }
};

const settingsPage = ():SettingsPage => ({
  type: 'settings',
  showNavigation: false
});

export const settingsRoute: RouteDefinition<SettingsPage> = {
  toUrl,
  toState,
  component: Settings
};
