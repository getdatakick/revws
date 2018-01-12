// @flow

export type Success = {
  type: 'success',
  data: any
}

export type Failure = {
  type: 'failed',
  error: string
}

export type ResponseType = Failure | Success;

export type Api = (cmd: string, payload:{}) => Promise<ResponseType>;

export type Command = (any, any, Api) => void;

export type GradingShapeType = {
  path: string,
  viewBox: string
}

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

export type ReviewType = {
  id: number,
  productId: number,
  displayName: string,
  email: string,
  title: string,
  content: ?string,
  grades: {
    [ number ]: number
  },
  date: Date,
  underReview: boolean,
  canVote: boolean,
  canEdit: boolean,
  canDelete: boolean,
  canReport: boolean
}

export type ReviewListType = Array<ReviewType>

export type ReviewFormErrors = {
  email: ?string,
  displayName: ?string,
  title: ?string,
  content: ?string
}

export type CriterionType = {
  id: number,
  label: string
}

export type CriteriaType = {
  [ number ] : CriterionType
}

export type EditStage = 'edit' | 'saving' | 'saved' | 'failed';
