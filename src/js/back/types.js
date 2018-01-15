// @flow
import type { GradingShapeType } from 'common/types';

export type SettingsType = {
  theme: {
    shape: string,
    shapeSize: {
      product: number,
      list: number,
      create: number,
    }
  },
  display: {
    product: {
      placement: string,
      showAverage: boolean,
    },
    productList: {
      show: boolean,
    },
    productComparison: {
      show: boolean,
    }
  },
  moderation: {
    enabled: boolean,
    needApprove: {
      create: boolean,
      edit: boolean,
      reported: boolean
    }
  },
  review: {
    displayName: string,
    allowGuestReviews: boolean,
    allowEmpty: boolean,
    allowVoting: boolean,
    allowReporting: boolean,
    allowDelete: boolean,
    allowEdit: boolean,
  }
}

export type GlobalDataType = {
  api: string,
  shapes: {
    [ string ]: GradingShapeType
  },

}
