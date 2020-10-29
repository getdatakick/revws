// @flow

export type Position = {
  x: number,
  y: number
};

export type HSV = {
  h: number,
  s: number,
  v: number
};

export type PresetType = {|
  label: string,
  colors: Array<string>
|};
