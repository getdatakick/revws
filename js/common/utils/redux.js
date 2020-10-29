// @flow
import { map, is } from 'ramda';
const isFunction = is(Function);

type Transformations = {
  [ string ]: Function | string
};

export const mapObject = (transformations: Transformations): ((object: {...}) => any) => (object: {}) => {
  return map(f => isFunction(f) ? f(object) : f, transformations);
};
