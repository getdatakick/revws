// @flow

import type { EntitiesType } from 'front/types';
import type { EntityInfoType, EntityType } from 'common/types';

export const getEntity = (entities: EntitiesType, entityType: EntityType, entityId: number): EntityInfoType => {
  const entity = entities[entityType][entityId];
  if (! entity) {
    throw new Error(`Entity ${entityType}:${entityId} not found`);
  }
  return entity;
};
