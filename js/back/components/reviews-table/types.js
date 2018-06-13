// @flow
import type { ListOrder } from 'common/types';

export type Filters = {
  deleted?: boolean,
  validated?: boolean
}

export type Column = {
  id: string,
  label: string,
  disablePadding?: boolean,
  sort?: ListOrder
}
