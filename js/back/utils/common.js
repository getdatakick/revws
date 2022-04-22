// @flow

import type { GlobalDataType } from 'back/types';
import { merge, reduce, append, toPairs } from 'ramda';

const storeBase = 'https://store.getdatakick.com';

const getUrlComponent = (pair) => encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);

export const getApiUrl = (data: GlobalDataType): string => {
  return data.storeUrl || (storeBase + '/en/module/datakickweb/api');
};

export const getWebUrl = (campaign: string, path: string, params: {} = {}): string => {
  if (!path || path.length == 0) {
    path = '/';
  } else {
    if (path[0] != '/')
      path = '/'+path;
    if (path[path.length - 1] != '/')
      path = path + '/';
  }
  params = merge({ 'utm_campaign': campaign, 'utm_source': 'chex', 'utm_medium': 'web' }, params);
  const pars = reduce((ret, pair) => append(getUrlComponent(pair), ret), [], toPairs(params)).join('&');
  return storeBase + path + '?' + pars;
};
