// @flow
import React from 'react';
import type { InitDataType } from 'front/types.js';
import { forEach, values, has, includes } from 'ramda';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import {createLogger} from 'redux-logger';
import createReducer from 'front/reducer/index.js';
import createCommands from 'front/commands/index.js';
import App from 'front/app.jsx';
import { parseInitData } from 'front/utils/init.js';
import { isObject } from 'common/utils/ramda.js';
import Types from 'front/actions/types.js';
import { setTranslation } from 'translations';

const getDomNode = () => {
  const node = document.getElementById('revws-app');
  if (node) {
    return node;
  }
  const body = document.body;
  if (body) {
    const created = document.createElement('div');
    created.setAttribute("id", "revws-app");
    created.style.height = '0';
    created.style.width = '0';
    body.append(created);
    return created;
  }
};

const startRevws = (init: InitDataType) => {
  const node = getDomNode();
  if (!node) {
    return;
  }
  const { settings, reviews, visitor, translations, widgets, entities, lists, initActions } = parseInitData(init);
  setTranslation(translations);
  const dev = process.env.NODE_ENV !== 'production';

  const commandsMiddleware = createCommands(settings);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(createLogger());
  }

  const reducer = createReducer(settings, visitor, reviews, lists, entities);
  const store = createStore(reducer, applyMiddleware(...middlewares));
  const isAction = (action: any) => {
    return (action && isObject(action) && has('type', action) && includes(action.type, values(Types)));
  };

  const root = createRoot(node);

  root.render(
    <Provider store={store}>
      <App visitor={visitor} settings={settings} widgets={widgets} />
    </Provider>
  );

  window.revws = (action: any) => {
    if (isAction(action)) {
      store.dispatch(action);
      return true;
    } else {
      return false;
    }
  };


  forEach(action => {
    if (isAction(action)) {
      store.dispatch(action);
    }
  }, initActions);

  store.dispatch({ type: 'REVWS_STARTED' });
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
