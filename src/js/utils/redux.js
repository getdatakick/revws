// @flow
import { map } from 'ramda';

type Transformations = {
  [ string ]: Function
};

export const mapObject = (transformations: Transformations) => (object: {}) => {
  return map(f => f(object), transformations);
};
