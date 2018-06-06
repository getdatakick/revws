// @flow
import { has, assoc } from 'ramda';
const item = 'revws-data';

export const getItem = (key: string) => {
  const data = getData();
  if (has(key, data)) {
    return data[key];
  }
  return null;
};

export const setItem = (key: string, value: any) => {
  return setData(assoc(key, value, getData()));
};

const getData = (): {} => {
  try {
    if (window.localStorage) {
      const raw = window.localStorage.getItem(item);
      if (raw) {
        return JSON.parse(atob(raw));
      }
    }
  } catch (e) {}
  return {};
};

const setData = (data: ?any) => {
  try {
    if (window.localStorage) {
      if (data) {
        window.localStorage.setItem(item, btoa(JSON.stringify(data)));
        return true;
      } else {
        window.localStorage.removeItem(item);
        return true;
      }
    }
  } catch (e) {}
  return false;
};
