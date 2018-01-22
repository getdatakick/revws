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
      orderBy: 'date' | 'grade' | 'usefulness',
      reviewsPerPage: number | string,
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
  },
  notifications: {
    admin: {
      email: string,
      language: number | string,
      reviewCreated: boolean,
      reviewUpdated: boolean,
      reviewDeleted: boolean,
      needApprove: boolean,
    },
    author: {
      thankYou: boolean,
      reviewApproved: boolean,
      reviewDeleted: boolean,
      reply: boolean,
    }
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

export type LoadOptions = 'all' | {
  pageSize: number,
  page: number
}

export type Load = {
  record: string,
  options: LoadOptions
};
