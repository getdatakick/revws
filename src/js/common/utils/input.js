// @flow
import { isObject, isArray } from './ramda';

export const asObject = (input: ?any): {} => {
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
