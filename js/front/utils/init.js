// @flow
import type { InitDataType, WidgetsType, TranslationsType, SettingsType, VisitorType, EntitiesType, ListsType, ReviewsType } from 'front/types';
import {  has, prop } from 'ramda';
import { isObject, isArray, isString } from 'common/utils/ramda';
import { asObject } from 'common/utils/input';
import { fixReviews } from 'common/utils/reviews';

export const parseInitData = (input: any): InitDataType => ({
  settings: getSettings(input.settings),
  reviews: getReviews(input.reviews),
  entities: getEntities(input.entities),
  translations: getTranslations(input.translations),
  visitor: getVisitor(input.visitor),
  lists: getLists(input.lists || {}),
  widgets: getWidgets(input.widgets || []),
  initActions: getInitActions(input.initActions)
});

const getSettings = (input: any): SettingsType => {
  if (! isObject(input)) {
    throw new Error('Invalid settings object');
  }

  const shopName = get('shopName', isString, input);
  const loginUrl = get('loginUrl', isString, input);
  const theme = get('theme', isObject, input);
  const shape = get('shape', isObject, theme);
  const shapeSize = get('shapeSize', isObject, theme);
  const preferences = get('preferences', isObject, input);
  const criteria = asObject(get('criteria', isObject, input));
  const api = get('api', isString, input);
  const csrf = get('csrf', isString, input);
  const gdpr = get('gdpr', isObject, input);
  const dateFormat = get('dateFormat', isString, input);

  return {
    csrf,
    shopName,
    api,
    loginUrl,
    criteria,
    shape,
    shapeSize,
    dateFormat,
    preferences,
    gdpr
  };
};

const getReviews = (input: any): ReviewsType => fixReviews(asObject(input));

const getTranslations = (input: any): TranslationsType => asObject(input);

const getVisitor = (input: any): VisitorType => asObject(input);

const getLists = (input: any): ListsType => asObject(input);

const getWidgets = (input: any): WidgetsType => input || {};

const getEntities = (input: any): EntitiesType => asObject(input);

const getInitActions = (input: any): Array<any> => isArray(input) ? input : [];

const get = (key, validator, obj) => {
  if (has(key, obj)) {
    const ret = prop(key, obj);
    if (validator(ret)) {
      return ret;
    }
  }
  throw new Error('Settings does not contain valid '+key);
};
