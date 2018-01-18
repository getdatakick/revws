// @flow
import type { RouteDefinition } from 'back/types';
import Home from 'back/pages/home';

export type HomePage = {
  type: 'home'
}

const toUrl = (home: HomePage) => {
  return '/';
};

const toState = (url: string): ?HomePage => {
  if (url === '/') {
    return homePage();
  }
};

export const homePage = ():HomePage => ({
  type: 'home'
});

export const homeRoute: RouteDefinition<HomePage> = {
  toUrl,
  toState,
  component: Home
};
