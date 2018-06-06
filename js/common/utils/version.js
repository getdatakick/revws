// @flow

export const versionNum = (version: ?string): number => {
  if (version) {
    const s = version.split('.');
    if (s.length === 3) {
      return (parseInt(s[0]) * 1000000) + (parseInt(s[1]) * 1000) + parseInt(s[2]);
    }
  }
  return 0;
};
