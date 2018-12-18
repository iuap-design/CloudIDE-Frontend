/**
 ** 2016-11-15 zhangmyh
 * 修改getTitleData参数和url
 ** 2016-11-10 zhangmyh
 * 修改setTitleData，添加POST请求
 ** Created by wxk on 2016/8/22.
 */
import React from 'react';
import env from '../env';
import * as common from 'yxyweb/server/controllers/common';

export default function (router) {
  router.get('/getTitleData/:billno/:tplid/:groupcode', async function (ctx) {
    //console.log('ctx------------------', ctx.request.body, '------------------ctx');
    let { billno, tplid, groupcode } = ctx.params;
    if (tplid === '0')
      tplid = '';
    let url = env.HTTP_USER_FETCH_BILLMETA;
    url += '?billno=' + billno + '&groupcode=' + groupcode + '&tplid=' + tplid + '&token=' + ctx.request.query.token;
    //console.log('url', url);
    let titleData = await common.doFetch(url);
    ctx.body = titleData;
    //console.log("titledata", titleData);
  })

  //http://localhost:8080/billmeta/updateBillitems.do?token=48c817c48cc9414f9142fc36679f64d3
  router.post('/setTitleData', async function (ctx) {
    let url = env.HTTP_USER_POST_BILLMETA;
    url += ('?token=' + ctx.request.query.token);
    //console.log('ctx------------------', url, ctx.request.body, '------------------ctx');
    let postheaders = new Headers();
    postheaders.append("Accept", "application/json");
    postheaders.append("Content-Type", "application/json");
    const postOption = {
      method: 'POST',
      headers: postheaders,
      body: JSON.stringify(ctx.request.body)
    };
    let titleData = await common.doFetch(url, postOption);
    ctx.body = titleData;
  })

  return router;
}
