// @flow
import { isEmpty as isEmptyOrig, is, isNil } from 'ramda';
export const isArray: any = is(Array);
export const isString: any = is(String);
export const isObject: any = is(Object);
export const isFunction: any = is(Function);
export const isNumber: any = is(Number);
export const isBoolean: any = is(Boolean);
export const isDate: any = is(Date);
export const notNil = (x?: any): any => !isNil(x);
export const isEmpty = (x?: any): any => isNil(x) || isEmptyOrig(x);
export const notEmpty = (x?: any): any => !isEmpty(x);
export const emptyIfNil = (x?: any):any => isNil(x) ? '' : x;
