// @flow

import type {Node} from 'react';
import React from 'react';
import { equals, memoizeWith, identity } from 'ramda';
import type { SettingsPage } from './settings.js';
import { settingsRoute } from './settings.js';
import type { SupportPage } from './support.js';
import { supportRoute } from './support.js';
export { supportPage } from './support.js';
import type { ModerationPage } from './moderation.js';
import { moderationRoute } from './moderation.js';
export { moderationPage } from './moderation.js';
import type { ReviewsPage } from './reviews.js';
import { reviewsRoute } from './reviews.js';
export { reviewsPage } from './reviews.js';
import type { CriteriaPage } from './criteria.js';
import { criteriaRoute } from './criteria.js';
export { criteriaPage } from './criteria.js';


export type RoutingState = (
  SettingsPage |
  SupportPage |
  ModerationPage |
  ReviewsPage |
  CriteriaPage
);

export type GoTo = (RoutingState) => void;

const routes = {
  settings: settingsRoute,
  support: supportRoute,
  moderation: moderationRoute,
  reviews: reviewsRoute,
  criteria: criteriaRoute
};


// API
export const transition = (from: ?RoutingState, to: RoutingState, store: any): boolean => {
  if (!equals(from, to)) {
    if (from && from.type === to.type) {
      const update = routes[to.type].update;
      // $FlowFixMe
      update && update(from, to, store);
    } else {
      if (from) {
        // teardown
        const teardown = routes[from.type].teardown;
        // $FlowFixMe
        teardown && teardown(from, store);
      }
      // setup
      const setup = routes[to.type].setup;
      // $FlowFixMe
      setup && setup(to, store);
    }
    return true;
  }
  return false;
};

export const render = (state:RoutingState, props: mixed): Node => {
  const { type, ...rest } = state;
  const Component = routes[type].component;
  return (
    <Component
      {...props}
      {...rest} />
  );
};

export const toUrl = (state: RoutingState): string => {
  const handler = routes[state.type].toUrl;
  // $FlowFixMe
  return fixUrl(handler(state));
};

export const toState: any = memoizeWith(identity, (url:string): ?RoutingState => {
  for (var k in routes) {
    const state = routes[k].toState(url);
    if (state) {
      return state;
    }
  }
});

export const fixUrl = (url: string): string => {
  if (!url || url === '') {
    return '/';
  }
  if (url === '/') {
    return url;
  }
  const lastPos = url.length - 1;
  if (url[lastPos] === '/') {
    return url.substring(0, lastPos);
  }
  return url;
};
