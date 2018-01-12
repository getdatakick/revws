// @flow
import 'es6-shim';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'front/reducer';
import createCommands from 'front/commands';
import App from './front/app';
import { getSettings, getReviews } from 'utils/settings';

if (window.revwsData) {
  const dev = process.env.NODE_ENV !== 'production';
  const node = document.getElementById('revws-tab-content');
  if (! node) {
    throw new Error('Element revws-app not found');
  }

  const settings = getSettings(window.revwsData);
  const reviews = getReviews(window.revwsData);
  const commandsMiddleware = createCommands(settings);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(logger);
  }

  const reducer = createReducer(settings, reviews);
  const store = createStore(reducer, applyMiddleware(...middlewares));

  render((
    <Provider store={store}>
      <App settings={settings}/>
    </Provider>
  ), node);
}
