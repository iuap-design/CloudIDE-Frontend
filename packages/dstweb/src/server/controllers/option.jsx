import React from 'react';
import env from '../env'
import * as common from 'yxyweb/server/controllers/common'
import { genFetchOptions } from 'yxyweb/common/helpers/util'

export default function (router) {
  router.get('/option.do/:subid', async function (ctx) {
    let url = env.HTTP_USER_FETCH_OPTIONDATA + '?token=' + ctx.request.query.token;
    const options = genFetchOptions('post', Object.assign({
      optionId: ctx.request.query.optionId,
      subid: ctx.request.query.subid,
      orgId: ctx.request.query.orgId
    }));
    let results = await common.doFetch(url, options);
    let json = {};
    if (!results || results.length == 0) {
      results = {
        code: 500,
        message: '没有查询到数据'
      }
    } else {
      if (results.code != 200) {
        json = results;
      } else {
        json = results.data;
      }
    }
    ctx.body = results;
  })
}
