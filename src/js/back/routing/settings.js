// @flow
import type { RouteDefinition } from 'back/types';
import Settings from 'back/pages/settings';

export type SettingsPage = {
  type: 'settings'
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
  type: 'settings'
});

export const settingsRoute: RouteDefinition<SettingsPage> = {
  toUrl,
  toState,
  component: Settings
};
