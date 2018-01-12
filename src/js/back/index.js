// @flow
import 'es6-shim';
import type { SettingsType } from 'back/types';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'back/reducer';
import createCommands from 'back/commands';
import App from 'back/app';
import { setSnackbar } from 'back/actions/creators';

window.startRevws = (settings: SettingsType) => {
  const dev = process.env.NODE_ENV !== 'production';
  const node = document.getElementById('revws-app');
  if (! node) {
    throw new Error('Element revws-app not found');
  }

  const commandsMiddleware = createCommands(settings);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(logger);
  }

  const reducer = createReducer();
  const store = createStore(reducer, applyMiddleware(...middlewares));

  render((
    <Provider store={store}>
      <App settings={settings}/>
    </Provider>
  ), node);

  store.dispatch(setSnackbar('Back loaded'));
};
