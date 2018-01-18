// @flow
import type { ReviewListType } from 'common/types';
import type { SettingsType } from 'front/types';
import {  has, prop } from 'ramda';
import { isObject, isString, isArray, isNumber } from 'common/utils/ramda';
import { asObject } from 'common/utils/input';
import { fixReviews } from 'common/utils/reviews';

export const getSettings = (input: any): SettingsType => {
  if (! isObject(input)) {
    throw new Error('Invalid settings object');
  }

  const theme = get('theme', isObject, input);
  const shape = get('shape', isObject, theme);
  const shapeSize = get('shapeSize', isObject, theme);
  const visitor = get('visitor', isObject, input);
  const preferences = get('preferences', isObject, input);
  const permissions = get('permissions', isObject, input);
  const product = get('product', isObject, input);
  const criteria = asObject(get('criteria', isObject, input));
  const api = get('api', isString, input);

  return {
    api,
    product,
    criteria,
    shape,
    shapeSize,
    visitor,
    permissions,
    preferences
  };
};

export const getReviews = (input: any): ReviewListType => {
  const envelope = get('reviews', isObject, input);
  const reviews = get('reviews', isArray, envelope);
  const total = get('total', isNumber, envelope);
  const pages = get('pages', isNumber, envelope);
  const page = get('page', isNumber, envelope);
  const pageSize = get('pageSize', isNumber, envelope);
  return {
    total,
    page,
    pages,
    pageSize,
    reviews: fixReviews(reviews)
  };
};

const get = (key, validator, obj) => {
  if (has(key, obj)) {
    const ret = prop(key, obj);
    if (validator(ret)) {
      return ret;
    }
  }
  throw new Error('Settings does not contain valid '+key);
};

export const isLoggedIn = (settings: SettingsType): boolean => {
  return settings.visitor.type === 'customer';
};
