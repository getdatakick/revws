// @flow

import type { CriteriaType, GradingShapeType } from 'common/types';

export type SettingsType = {
  api: string,
  criteria: CriteriaType,
  shape: GradingShapeType,
  product: ProductInfoType,
  shapeSize: {
    product: number,
    list: number,
    create: number
  },
  visitor: {
    type: 'customer' | 'guest',
    displayName: string,
    email: string,
  },
  permissions: {
    create: boolean
  },
  preferences: {
    allowEmptyReviews: boolean
  }
}

export type ProductInfoType = {
  id: number,
  name: string,
  url: string,
  image: string,
  criteria: Array<number>
}
