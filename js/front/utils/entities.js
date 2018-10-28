// @flow

import type { EntitiesType } from 'front/types';
import type { EntityInfoType, EntityType } from 'common/types';

export const getEntity = (entities: EntitiesType, entityType: EntityType, entityId: number): EntityInfoType => entities[entityType][entityId];
