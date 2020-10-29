// @flow
import type { ReviewType, ReviewFormErrors } from 'common/types';
import { isEmpty, isObject, notNil, isString, isNumber } from 'common/utils/ramda';
import { isNil, find, curry, pipe, defaultTo, values, map, reduce, or } from 'ramda';
import validator from 'validator';

export const validateVersion = (version: ?string): ?string => {
  if (! version) {
    return "Invalid version";
  }
  const arr = version.split('.');
  if (arr.length != 3) {
    return "Invalid version";
  }
  for (var i = 0; i < arr.length; i++) {
    if (validateIsNumber(arr[i])) {
      return "Invalid version";
    }
  }
  return null;
};

export const validateImages = (images: Array<string>): null | string => {
  if (isNil(find(isEmpty, images))) {
    return null;
  }
  return "Image not uploaded";
};

export const validateReview = (allowEmptyTitle: boolean, allowEmptyReviews: boolean, review: ReviewType): ReviewFormErrors => ({
  email: validateReviewEmail(review.email),
  displayName: validateDisplayName(review.displayName),
  title: validateTitle(allowEmptyTitle, review.title),
  content: validateContent(allowEmptyReviews, review.content),
  images: validateImages(review.images)
});


const isError = (err: any) => isObject(err) ? hasErrors(err) : notNil(err);
export const hasErrors: any = pipe(
  defaultTo({}),
  values,
  map(isError),
  reduce(or, false)
);

export const isEmail = (email: string): any => validator.isEmail(email);

const notEmpty = curry((errorMessage: string, value: ?string):?string => isEmpty(value) ? errorMessage : null);

export const validateDisplayName: any = notEmpty(__("Please provide your name"));

export const validateTitle = (allowEmptyTitle: boolean, title: ?string): any | null => {
  if (allowEmptyTitle) {
    return null;
  }
  return notEmpty(__("Review title must be set"), title);
};

export const validateContent = (allowEmptyReviews: boolean, content: ?string): any | null => {
  if (allowEmptyReviews) {
    return null;
  }
  return notEmpty(__("Review content must be set"), content);
};

export const validateReviewEmail = (email: ?string): null | string => {
  if (isEmpty(email) || !validator.isEmail(email)) {
    return __("Please provide valid email address");
  }
  return null;
};

export const validateIsNumber = (input: any): ?string => {
  if (isNumber(input)) {
    return null;
  }
  if (isString(input) && validator.isNumeric(input)) {
    return null;
  }
  return __("Invalid number");
};

export const isUrl = (input: string): any | boolean => {
  if (! input) {
    return false;
  }
  if (! isString(input)) {
    return false;
  }
  return validator.isURL(input);
};
