// @flow
import type { ReviewType, ReviewListType } from 'common/types';
import type { SettingsType } from 'front/types';
import { assoc, map, has, prop, indexBy } from 'ramda';
import { isObject, isString, isArray } from 'common/utils/ramda';

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
  const criteria = indexBy(prop('id'), get('criteria', isArray, input));
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
  const reviews = get('reviews', isArray, input);
  return map(fixReview, reviews);
};

export const fixReview = (review: any): ReviewType => {
  let ret = assoc('date', new Date(review.date), review);
  if (isArray(ret.grades)) {
    ret = assoc('grades', {}, ret);
  }
  return ret;
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
