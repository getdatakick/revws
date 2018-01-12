// @flow
import { isEmpty as isEmptyOrig, is, isNil } from 'ramda';
export const isArray = is(Array);
export const isString = is(String);
export const isObject = is(Object);
export const isFunction = is(Function);
export const isNumber = is(Number);
export const isBoolean = is(Boolean);
export const isDate = is(Date);
export const notNil = (x?: any) => !isNil(x);
export const isEmpty = (x?: any) => isNil(x) || isEmptyOrig(x);
export const notEmpty = (x?: any) => !isEmpty(x);
export const emptyIfNil = (x?: any):any => isNil(x) ? '' : x;
