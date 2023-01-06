// @flow
import type { FullCriteria, SettingsType, GlobalDataType, VersionCheck, AccountType } from 'back/types.js';
import React from 'react';
import { equals } from 'ramda';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import {createLogger} from 'redux-logger';
import createReducer from 'back/reducer/index.js';
import createCommands from 'back/commands/index.js';
import elementResizeDetectorMaker from 'element-resize-detector';
import { setSize, goTo, checkModuleVersion } from 'back/actions/creators.js';
import { transition, toState, fixUrl, toUrl } from 'back/routing/index.js';
import { moderationPage } from 'back/routing/moderation.js';
import { getRoutingState } from 'back/selectors/routing-state.js';
import { createHashHistory } from 'history';
import { setTranslation } from 'translations';
import { asObject } from 'common/utils/input.js';
import Types from 'back/actions/types.js';
import App from 'back/app.jsx';
import moment from 'moment';
import type {Action} from "back/actions/index.js";

const watchElementSize = (node:HTMLElement, store:any) => {
  let lastWidth = null;
  let lastHeight = null;
  const updateSize = (element:HTMLElement) => {
    const width = Math.round(element.offsetWidth);
    const height = Math.round(element.offsetHeight);
    if (width !== lastWidth || height !== lastHeight) {
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


const syncHistory = (history:any) => (store:any) => (next:any) => (action:Action) => {
  let currentState = null;
  if (action.type === Types.goTo) {
    currentState = getRoutingState(store.getState());
  }
  const result = next(action);
  if (action.type === Types.goTo) {
    transition(currentState, action.routingState, store);

    if (action.updateHistory) {
      const newUrl = toUrl(action.routingState);
      if (newUrl !== fixUrl(history.location.pathname)) {
        history.push(newUrl);
      }
    }
  }
  return result;
};

window.startRevws = (init: any) => {
  setTranslation(asObject(init.translations));
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
  const versionCheck: VersionCheck = init.versionCheck;
  const account: AccountType = {
    activated: data.activated,
    shouldReview: data.shouldReview,
    version: data.version,
    versionCheck
  };

  const commandsMiddleware = createCommands(data);
  const middlewares = [
    commandsMiddleware,
    syncHistory(history)
  ];
  if (dev) {
    middlewares.push(createLogger());
  }

  let routingState = toState(fixUrl(history.location.pathname));
  if (! routingState) {
    routingState = moderationPage();
    history.replace(toUrl(routingState));
  }
  const reducer = createReducer(routingState, settings, criteria, account);
  const store = createStore(reducer, applyMiddleware(...middlewares));

  watchElementSize(node, store);
  history.listen(({location}) => {
    const currentUrl = fixUrl(location.pathname);
    const routingState = toState(currentUrl);
    const currentState = getRoutingState(store.getState());
    if (! routingState) {
      const newUrl = toUrl(currentState);
      if (newUrl !== currentUrl) {
        history.replace(newUrl);
      } else {
        console.error("Failed to map '" + currentUrl + "' to state");
        store.dispatch(goTo(moderationPage()));
      }
    } else {
      if (! equals(routingState, currentState)) {
        store.dispatch(goTo(routingState, false));
      }
    }
  });

  const lastCheck = moment(versionCheck.ts);
  const threshold = moment().add(-6, 'hour');
  if (! lastCheck.isValid() || lastCheck.isBefore(threshold)) {
    store.dispatch(checkModuleVersion());
  }

  render((
    <Provider store={store}>
      <App data={data}/>
    </Provider>
  ), node);
};
