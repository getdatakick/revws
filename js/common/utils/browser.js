// @flow

export const getFontSize = (): number => {
  const doc = document.documentElement;
  if (doc) {
    return parseFloat(getComputedStyle(doc).fontSize);
  }
  return 10;
};
