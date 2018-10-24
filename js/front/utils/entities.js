// @flow

import type { EntitiesType } from 'front/types';
import type { EntityInfoType, EntityType } from 'common/types';

const mapping = {
  'PRODUCT': 'products'
};

export const getEntity = (entities: EntitiesType, entityType: EntityType, entityId: number): EntityInfoType => {
  const key = mapping[entityType];
  if (key) {
    return entities[key][entityId];
  }
  throw new Error('Unknown entity type: '+entityType);
};
