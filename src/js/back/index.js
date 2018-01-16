// @flow
import type { FullCriteria, SettingsType, GlobalDataType } from 'back/types';
import React from 'react';
import { equals } from 'ramda';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'back/reducer';
import createCommands from 'back/commands';
import elementResizeDetectorMaker from 'element-resize-detector';
import { setSize, goTo } from 'back/actions/creators';
import { transition, toState, fixUrl, toUrl } from 'back/routing';
import { homePage } from 'back/routing/home';
import { getRoutingState } from 'back/selectors/routing-state';
import { createHashHistory } from 'history';
import Types from 'back/actions/types';
import App from 'back/app';

const watchElementSize = (node, store) => {
  let lastWidth = null;
  let lastHeight = null;
  const updateSize = (element) => {
    const width = Math.round(element.offsetWidth);
    const height = Math.round(element.offsetHeight);
    if (width != lastWidth || height != lastHeight) {
      lastWidth = width;
      lastHeight = height;
      store.dispatch(setSize(width, height));
    }
  };

  updateSize(node);
  const resizeDetector = elementResizeDetectorMaker({
    strategy: "scroll"
  });
  resizeDetector.listenTo(node, updateSize);
};


const syncHistory = history => store => next => action => {
  let currentState = null;
  if (action.type === Types.goTo) {
    currentState = getRoutingState(store.getState());
  }
  const result = next(action);
  if (action.type === Types.goTo) {
    transition(currentState, action.routingState, store);

    if (action.updateHistory) {
      const newUrl = toUrl(action.routingState);
      if (newUrl != fixUrl(history.location.pathname)) {
        history.push(newUrl);
      }
    }
  }
  return result;
};

window.startRevws = (init: any) => {
  const content = document.getElementById('content');
  if (content) {
    content.className = 'app-content';
  }
  const dev = process.env.NODE_ENV !== 'production';
  const node = document.getElementById('revws-app');
  if (! node) {
    throw new Error('Element revws-app not found');
  }

  // setup routing
  const history = createHashHistory({
    queryKey: false
  });


  const data: GlobalDataType = init.data;
  const settings: SettingsType = init.settings;
  const criteria: FullCriteria = init.criteria;

  const commandsMiddleware = createCommands(data);
  const middlewares = [
    commandsMiddleware,
    syncHistory(history)
  ];
  if (dev) {
    middlewares.push(logger);
  }

  let routingState = toState(fixUrl(history.location.pathname));
  if (! routingState) {
    routingState = homePage();
    history.replace('/');
  }

  const reducer = createReducer(routingState, settings, criteria);
  const store = createStore(reducer, applyMiddleware(...middlewares));

  watchElementSize(node, store);
  history.listen((location, action) => {
    const currentUrl = fixUrl(location.pathname);
    const routingState = toState(currentUrl);
    const currentState = getRoutingState(store.getState());
    if (! routingState) {
      const newUrl = toUrl(currentState);
      if (newUrl != currentUrl) {
        history.replace(newUrl);
      } else {
        console.error("Failed to map '" + currentUrl + "' to state");
        store.dispatch(goTo(homePage()));
      }
    } else {
      if (! equals(routingState, currentState)) {
        store.dispatch(goTo(routingState, false));
      }
    }
  });

  render((
    <Provider store={store}>
      <App data={data}/>
    </Provider>
  ), node);
};
