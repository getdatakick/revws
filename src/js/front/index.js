// @flow
import React from 'react';
import { values, has, contains } from 'ramda';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'front/reducer';
import createCommands from 'front/commands';
import App from 'front/app';
import { getSettings, getReviews } from 'front/settings';
import { isObject } from 'common/utils/ramda';
import Types from 'front/actions/types';

const startRevws = (init: any) => {
  const dev = process.env.NODE_ENV !== 'production';
  const node = document.getElementById('revws-app');
  if (! node) {
    throw new Error('Element revws-app not found');
  }

  const settings = getSettings(init);
  const reviews = getReviews(init);
  const commandsMiddleware = createCommands(settings);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(logger);
  }

  const reducer = createReducer(settings, reviews, init.productsToReview);
  const store = createStore(reducer, applyMiddleware(...middlewares));

  render((
    <Provider store={store}>
      <App
        type={init.entityType}
        id={init.entityId}
        settings={settings}/>
    </Provider>
  ), node);

  window.revws = (action: any) => {
    if (action && isObject(action) && has('type', action) && contains(action.type, values(Types))) {
      store.dispatch(action);
      return true;
    } else {
      return false;
    }
  };
};

if (document.readyState === 'complete') {
  startRevws(window.revwsData);
} else {
  document.addEventListener('readystatechange',  () => {
    if (document.readyState === 'complete') {
      startRevws(window.revwsData);
    }
  });
}
