// @flow
import { merge, reduce, append, toPairs } from 'ramda';

const getUrlComponent = (pair) => encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]);

export const getWebUrl = (campaign: string, path: string, params: {} = {}) => {
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
  return 'https://www.getdatakick.com' + path + '?' + pars;
};
