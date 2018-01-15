// @flow
import { path } from 'ramda';

const get = (key: string) => path(['ui', key]);
export const getWidth = get('width');
export const getHeight = get('height');
