// @flow
import { isObject, isArray } from './ramda';

export const asObject = (input: ?any): any => {
  if (! input) {
    return {};
  }
  if (isArray(input)) {
    if (input.length == 0) {
      return {};
    }
  } else if (isObject(input)) {
    return input;
  }
  throw new Error("Invalid input");
};

export const prevent = (e: ?any) => {
  if (e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
  }
};
