// @flow
import type { LangString, LanguagesType, GradingShapeType } from 'common/types';

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
  language: number,
  languages: LanguagesType
}

export type FullCriterion = {
  id: number,
  active: boolean,
  global: boolean,
  label: LangString,
  products: Array<number>,
  categories: Array<number>
}

export type FullCriteria = {
  [ number ]: FullCriterion
}

// route definition
export type RouteDefinition<T> = {
  toUrl: (T) => string,
  toState: (string) => ?T,
  component: any,
  setup?: (T, any)=>void,
  update?: (T, T, any)=>void,
  teardown?: (T, any)=>void
};
