// @flow

export const fixUrl = (url: ?string): ?string => {
  if (url) {
    if (url.indexOf('http') == 0) {
      return url.replace('http:', window.location.protocol);
    }
  }
  return url;
};
