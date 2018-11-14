// @flow
import type { ListOrder, EntityType } from 'common/types';

export type Filters = {
  deleted?: boolean,
  validated?: boolean,
  entityType?: EntityType
}

export type Column = {
  id: string,
  label: string,
  disablePadding?: boolean,
  sort?: ListOrder
}
