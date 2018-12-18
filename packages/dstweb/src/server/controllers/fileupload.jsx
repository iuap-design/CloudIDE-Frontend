import React from 'react';
import env from '../env'
import { combine } from 'yxyweb/common/helpers/util'
import * as common from './common'
import request from 'request'

export default function (router) {
  const FILE_ROUTE = '/upload'
  const FILE_ROUTE1 = '/upload2Local'
  router.post(FILE_ROUTE, async function (ctx) {
    const { req, res, path } = ctx
    const serviceUrl = env.HTTP_USER_UPLOAD + ctx.req.url.substr(FILE_ROUTE.length)
    ctx.body = await req.pipe(request(serviceUrl))
    return
  })
  router.post('/upload2Local', async function (ctx) {
    const { req, res, path } = ctx
    const serviceUrl = env.HTTP_USER_UPLOAD2LOCAL + ctx.req.url.substr(FILE_ROUTE1.length)
    ctx.body = await req.pipe(request(serviceUrl))
    return
  })


  router.get('/register/validcode', async function (ctx) {
    ctx.logger.info(`参数：${env.HTTP_USER_VALIDCODE}`);
    ctx.body = await ctx.req.pipe(request(combine(env.HTTP_SERVICE_BASEURL, ctx.url)));
  })

  router.post('/*bill/billImport', async function (ctx) {
    const { req } = ctx;
    const serviceUrl = combine(env.HTTP_SERVICE_BASEURL, req.url);
    ctx.type = env.HTTP_CONTENT_TYPE.JSON;
    ctx.body = await req.pipe(request(serviceUrl));
  })

  router.all('/print/*', async function (ctx) {
    const { req } = ctx;
    const serviceUrl = combine(env.HTTP_PRINT_SERVER, req.url);
    ctx.type = 'html';
    ctx.body = await req.pipe(request(serviceUrl));
  })

  const UNIFORM_ROUTE = '/uniformdata/*';

  router.all(UNIFORM_ROUTE, async function (ctx) {
    const { req } = ctx;
    const serviceUrl = combine(env.HTTP_SERVICE_BASEURL, req.url.substr(UNIFORM_ROUTE.length - 1));
    ctx.type = env.HTTP_CONTENT_TYPE.JSON;
    ctx.body = await req.pipe(request(serviceUrl));
  });
}
