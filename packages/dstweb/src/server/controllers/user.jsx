// import React from 'react';

import env from '../env';
import { genFetchOptions, toJSON, catchException, combine, uniformProxy } from 'yxyweb/common/helpers/util';
// import * as actions from '../../common/redux/modules/user';

export default function (router) {
  router.post('/user/registercorp', async function (ctx) {
    const inform = ctx.request.body;
    let options;
    if (ctx.request.query.type != "enable") {
      let userInform = { user: {}, corp: {}, mobileFlag: true };

      userInform.user.username = inform.user;
      userInform.user.password = inform.pwd;
      userInform.user.email = inform.email;
      userInform.user.mobile = inform.mobile;
      userInform.user.fullname = (inform.fullname) ? inform.fullname : inform.user;

      userInform.corp.name = inform.corpname;
      userInform.corp.alias = inform.corpalias;

      options = genFetchOptions('post', userInform);

      await fetch(env.HTTP_USER_REG_CORP, options)
        .then(function (response) {
          if (response.status === 200) {
            return response.json()
          }
          return { code: 500 }
        }, catchException)
        .then(json => {
          ctx.body = json;
        })
    }
    else {
      const accInform = { alias: inform.corpalias };
      options = genFetchOptions('post', accInform);
      await fetch(env.HTTP_USER_CREATE_ACC, options)
        .then(function (response) {
          if (response.status === 200) {
            return response.json();
          }
          return { code: 500 }
        }, catchException)
        .then(json => {
          ctx.body = json;
        })
    }
  })

  router.post('/user/login', async function (ctx) {
    const requestUrl = env.HTTP_USER_AUTHENTICATION;
    const requestData = ctx.request.body;
    ctx.logger.info(`请求地址：${requestUrl}`)
    ctx.logger.info(`请求参数：${JSON.stringify(requestData)}`)
    const options = genFetchOptions('post', requestData)
    const now = Date.now()
    await fetch(requestUrl, options)
      .then(toJSON, catchException)
      .then(json => {
        ctx.logger.info(`返回数据：${JSON.stringify(json)}`)
        if (json.code === 200) {
          const host = ctx.host.split(':')[0]
          const expires = new Date(now + 24 * 3600 * 1000)

          // ctx.cookies.set('user', encodeURIComponent(JSON.stringify(json.data)), {
          ctx.cookies.set('token', json.data.token, {
            // domain: host,
            path: '/',
            expires,
            httpOnly: false,
          })
        }
        ctx.body = json
      })
  })

  router.post('/user/authorize', async function (ctx) {
    const requestUrl = env.HTTP_USER_AUTHENTICATION;
    const requestData = ctx.request.body;
    ctx.logger.info(`请求地址：${requestUrl}`)
    ctx.logger.info(`请求参数：${JSON.stringify(requestData)}`)
    const options = genFetchOptions('post', requestData)
    const now = Date.now()
    await fetch(requestUrl, options)
      .then(toJSON, catchException)
      .then(json => {
        ctx.logger.info(`返回数据：${JSON.stringify(json)}`)
        if (json.code === 200) {
          const host = ctx.host.split(':')[0]
          const expires = new Date(now + 24 * 3600 * 1000)

          // ctx.cookies.set('user', encodeURIComponent(JSON.stringify(json.data)), {
          // 过期商户不写入cookie
          if (json.data.leftTime != -1) {
            ctx.cookies.set('token', json.data.token, {
              // domain: host,
              path: '/',
              expires,
              httpOnly: false,
            })
          }

        }
        ctx.body = json
      })
  })

  router.post('/user/getCorpAccounts', async function (ctx) {
    console.log(ctx.request.body);
    console.log(env.HTTP_USER_COR_ACC);
    const options = genFetchOptions('post', ctx.request.body);
    await fetch(env.HTTP_USER_COR_ACC, options)
      .then(function (response) {
        if (response.status === 200) {
          return response.json()
        }
        return {
          code: 500
        }
      }, catchException)
      .then(json => {
        if (json.code === 200) {
          /*const host = ctx.host.split(':')[0]
           const expires = new Date(now + 24 * 3600 * 1000)

           ctx.cookies.set('user', encodeURIComponent(JSON.stringify(json.data)), {
           // domain: host,
           path: '/',
           expires,
           httpOnly: false,
           })*/
        }
        ctx.body = json;
      })
  })

  router.post('/user/getUserOrgs', async function (ctx) {
    console.log(ctx.request.body);
    console.log(env.HTTP_USER_ORG);
    const options = genFetchOptions('post', ctx.request.body);
    await fetch(env.HTTP_USER_ORG, options)
      .then(function (response) {
        if (response.status === 200) {
          return response.json()
        }
        return {
          code: 500
        }
      }, catchException)
      .then(json => {
        if (json.code === 200) {
        }
        ctx.body = json;
      })
  })

  router.get('/weChat/callback', async function (ctx) {
    const { query, querystring } = ctx.request;
    if (query.debug) {
      ctx.redirect(`http://fangqg.yonyouup.com/weChat/callbacktest?${querystring}`);
      return;
    }
    await doWeChatCallback(ctx);
  });

  router.get('/weChat/callbacktest', async function (ctx) {
    await doWeChatCallback(ctx);
  });

  const doWeChatCallback = async function (ctx) {
    const url = combine(env.HTTP_SERVICE_BASEURL, `weChat/callback?${ctx.request.querystring}`);
    const config = {
      url,
      method: 'GET'
    };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      setCookie(ctx, json.data.token);
      ctx.redirect('/portal');
      return;
    }
    if (json.code === 902) {
      ctx.cookies.set('weChatRandom', json.data, {
        path: '/',
        expires: new Date(Date.now() + 24 * 3600 * 1000),
        httpOnly: true
      });
      ctx.redirect('/wechat');
      return;
    }
    ctx.logger.error(`微信回调失败：【接口】${url} 【异常】${json.message}`);
    ctx.body = json;
  }

  const setCookie = function (ctx, token) {
    ctx.cookies.set('token', token, {
      path: '/',
      expires: new Date(Date.now() + 24 * 3600 * 1000),
      httpOnly: false
    });
  }

  router.post('/weChat/bindExistUser', async function (ctx) {
    const { cookies, request, req } = ctx;
    const params = request.body;
    params.weChatRandom = cookies.get('weChatRandom');
    const url = combine(env.HTTP_SERVICE_BASEURL, 'weChat/bindExistUser');
    const config = {
      url,
      method: 'POST',
      params,
      headers: {
        'content-type': env.HTTP_CONTENT_TYPE.JSON,
        origin: 'koa2 server',
        cookie: req.headers.cookie
      }
    };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      setCookie(ctx, json.data.token);
      ctx.body = json;
      return;
    }
    ctx.logger.error(`微信回调失败：【接口】${url} 【异常】${json.message}`);
    ctx.body = json;
  });

  router.get('/meta/voucherlist/aa_productlist', async function (ctx) {
    const { query } = ctx.request;
    const url = combine(env.HTTP_SERVICE_BASEURL, `user/loginByYxyToken?yxyToken=${query.yxyToken}`);
    const config = {
      url,
      method: 'GET'
    };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      setCookie(ctx, json.data.token);
      ctx.render({
        title: '货品档案'
      });
    } else {
      ctx.logger.error(`根据yxyToken获取token失败：【接口】${url} 【异常】${json.message}`);
      ctx.body = json;
    }
  });

  router.get('/demoAccount/login', async function (ctx) {
    const url = combine(env.HTTP_SERVICE_BASEURL, ctx.url);
    const config = { url, method: 'GET' };
    const json = await uniformProxy(config);
    if (json.code === 200)
      setCookie(ctx, json.data.token);
    ctx.body = json;
  });

  router.get('/demo/:account', async function (ctx) {
    const { account } = ctx.params;
    const url = combine(env.HTTP_SERVICE_BASEURL, `demoAccount/login?loginAccount=${account}`);
    const config = { url, method: 'GET' };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      setCookie(ctx, json.data.token);
      ctx.redirect('/portal');
    } else {
      ctx.logger.error(`演示行业账号登录失败：【接口】${url} 【异常】${json.message}`);
      ctx.body = json;
    }
  });

  router.get('/demo/:username/:password', async function (ctx) {
    const { username, password } = ctx.params;
    const url = env.HTTP_USER_AUTHENTICATION;
    const config = { url, method: 'POST', params: { username, password } };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      setCookie(ctx, json.data.token);
      ctx.redirect('/portal');
    } else {
      ctx.logger.error(`演示用户密码登录失败：【接口】${url} 【异常】${json.message}`);
      ctx.body = json;
    }
  });

  router.get('/thirdparty/check', async function (ctx) {
    const { yxyToken } = ctx.query;
    const url = combine(env.HTTP_SERVICE_BASEURL, `user/loginByYxyToken?yxyToken=${yxyToken}`);
    const config = {
      url,
      method: 'GET'
    };
    const json = await uniformProxy(config);
    if (json.code === 200) {
      if (json.data) {
        setCookie(ctx, json.data.token);
        ctx.redirect('/portal');
      } else {
        json.message = '登录失败，用户不存在';
        ctx.logger.error(`根据yxyToken获取token失败：【接口】${url} 【异常】${json.message}`);
        ctx.body = json;
      }
    } else {
      ctx.logger.error(`根据yxyToken获取token失败：【接口】${url} 【异常】${json.message}`);
      ctx.body = json;
    }
  });

  router.get('/user/switchInterMode', function (ctx) {
    const { mode } = ctx.query;
    ctx.cookies.set('interMode', mode, {
      path: '/',
      expires: new Date(Date.now() + 24 * 3600 * 1000),
      httpOnly: true
    });
    ctx.body = {
      code: 200,
      data: {
        redirectUrl: mode === 'pc' ? '/portal' : '/billing'
      }
    };
  });

  return router
}
