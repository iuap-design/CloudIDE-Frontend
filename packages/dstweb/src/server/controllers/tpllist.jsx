import React from 'react';
import env from '../env'
import * as common from 'yxyweb/server/controllers/common'

export default function (router) {
  router.post('/tpllist', async function (ctx) {
    let postData = ctx.request.body
    const billno = postData.billNo;
    const mode = postData.mode || 0;
    let url = env.HTTP_USER_FETCH_TPLLIST + '?billno=' + billno + '&mode=' + mode + '&token=' + ctx.request.query.token;
    let results = await common.doFetch(url);
    // console.log(results)
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
