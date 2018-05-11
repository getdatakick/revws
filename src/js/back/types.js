// @flow
import type { NameFormatType, LangString, LanguagesType, GradingShapeType, ShapeColorsType, DisplayCriteriaType } from 'common/types';
export type { RoutingState, GoTo } from 'back/routing';

export type SettingsType = {
  module: {
    checkModuleVersion: boolean
  },
  general: {
    multilang: boolean
  },
  theme: {
    shape: string,
    colors: ShapeColorsType,
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
      averagePlacement: 'rightColumn' | 'buttons' | 'none',
      showSignInButton: boolean,
    },
    productList: {
      show: boolean
    },
    productComparison: {
      show: boolean,
    },
    myReviews: {
      show: boolean,
      iconClass: string,
      reviewsPerPage: number | string,
      maxRequests: number | string,
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
    displayName: NameFormatType,
    allowGuestReviews: boolean,
    allowEmpty: boolean,
    allowVoting: boolean,
    allowReporting: boolean,
    allowDelete: boolean,
    allowEdit: boolean,
    displayCriteria: DisplayCriteriaType
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
  },
  richSnippets: {
    enabled: boolean
  },
  gdpr: {
    implementation: 'none' | 'basic' | 'psgdpr'
  }
}

export type EnvironmentType = {
  productcomments: boolean,
  krona: boolean,
  mailstream: boolean,
  psgdpr: boolean
}

export type GlobalDataType = {
  version: string,
  versionUrl: string,
  api: string,
  shopName: string,
  baseUrl: string,
  shapes: {
    [ string ]: GradingShapeType
  },
  language: number,
  languages: LanguagesType,
  platform: string,
  platformVersion: string,
  environment: EnvironmentType
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


export type VersionCheck = {
  version: ?string,
  ts: ?number,
  notes?: ?string
}
