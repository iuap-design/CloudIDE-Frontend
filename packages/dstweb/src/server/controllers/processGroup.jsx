import React from 'react';
import env from '../env'
import * as common from 'yxyweb/server/controllers/common'

export default function (router) {
  router.get('/process/:billNo/:id', async function (ctx) {
    let url = env.HTTP_USER_FETCH_PROCESSMETA + '?billNumber=' + ctx.params.billNo + '&id=' + ctx.params.id + '&token=' + ctx.request.query.token;
    console.log(url)
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
