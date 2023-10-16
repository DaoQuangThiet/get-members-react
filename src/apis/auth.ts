import { HttpUtils, http } from '../../utils/http';
import {
  getAccessTokenFromHTMLDoc,
  getActIdFromHTMLDoc,
} from './../../utils/facebookHelpers';

async function getActId() {
  return http.facebookInstance
    .getInstance()
    .get<string>('/adsmanager/manage/campaigns')
    .then(HttpUtils.getDataFromHttpResponse)
    .then(getActIdFromHTMLDoc);
}

async function getAccessToken(actId: string) {
  return http.facebookInstance
    .getInstance()
    .get<string>(
      `/adsmanager/manage/campaigns?act=${actId}&breakdown_regrouping=0&nav_source=no_referrer`
    )
    .then(HttpUtils.getDataFromHttpResponse)
    .then(getAccessTokenFromHTMLDoc);
}

export { getAccessToken, getActId };
