// @flow
import type { RouteDefinition } from 'back/types';
import Home from 'back/pages/home/home';

export type HomePage = {
  type: 'home'
}

const toUrl = (home: HomePage) => {
  return '/home';
};

const toState = (url: string): ?HomePage => {
  if (url === '/home') {
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
