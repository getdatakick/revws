// @flow

export type SettingsType = {
  api: string,
  settings: {
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
      allowGuestReviews: boolean,
      allowVoting: boolean,
      allowReporting: boolean,
      allowDelete: boolean,
      allowEdit: boolean,
    },
    authoring: {
      displayName: string,
      allowEmpty: boolean,
    }
  }
}
