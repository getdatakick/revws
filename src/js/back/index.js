// @flow
import type { FullCriteria, SettingsType, GlobalDataType } from 'back/types';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'back/reducer';
import createCommands from 'back/commands';
import elementResizeDetectorMaker from 'element-resize-detector';
import { setSize } from 'back/actions/creators';
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

  const data: GlobalDataType = init.data;
  const settings: SettingsType = init.settings;
  const criteria: FullCriteria = init.criteria;

  const commandsMiddleware = createCommands(data);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(logger);
  }

  const reducer = createReducer(settings, criteria);
  const store = createStore(reducer, applyMiddleware(...middlewares));

  watchElementSize(node, store);

  render((
    <Provider store={store}>
      <App data={data}/>
    </Provider>
  ), node);
};
