// @flow
import React from 'react';
import { forEach, values, has, contains } from 'ramda';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createReducer from 'front/reducer';
import createCommands from 'front/commands';
import App from 'front/app';
import { getSettings, getReviews } from 'front/settings';
import { isObject, isArray } from 'common/utils/ramda';
import { asObject } from 'common/utils/input';
import Types from 'front/actions/types';
import { setTranslation } from 'translations';
import { canReviewProduct } from 'front/utils/product';

const getDomNode = () => {
  const node = document.getElementById('revws-app');
  if (node) {
    return node;
  }
  const body = document.body;
  if (body) {
    const created = document.createElement('div');
    created.setAttribute("id", "revws-app");
    created.style.display = 'none';
    body.append(created);
    return created;
  }
};

const startRevws = (init: any) => {
  const node = getDomNode();
  if (! node) {
    return;
  }
  setTranslation(asObject(init.translations));
  const dev = process.env.NODE_ENV !== 'production';

  const settings = getSettings(init);
  const reviews = getReviews(init);
  const commandsMiddleware = createCommands(settings);
  const middlewares = [ commandsMiddleware ];
  if (dev) {
    middlewares.push(logger);
  }

  const reducer = createReducer(settings, reviews, init.productsToReview, init.reviewedProducts);
  const store = createStore(reducer, applyMiddleware(...middlewares));
  const isAction = (action: any) => {
    return (action && isObject(action) && has('type', action) && contains(action.type, values(Types)));
  };

  render((
    <Provider store={store}>
      <App
        type={init.entityType}
        id={init.entityId}
        settings={settings}/>
    </Provider>
  ), node);

  window.revws = (action: any) => {
    if (isAction(action)) {
      store.dispatch(action);
      return true;
    } else {
      return false;
    }
  };


  if (init.entityType === 'product' && window.location.href.indexOf('post_review') > -1 && canReviewProduct(settings, init.entityId)) {
    store.dispatch({
      type: 'TRIGGER_CREATE_REVIEW',
      productId: init.entityId
    });
  }

  const initActions = init.initActions;
  if (initActions && isArray(initActions)) {
    forEach(action => {
      if (isAction(action)) {
        store.dispatch(action);
      }
    }, initActions);
  }
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
