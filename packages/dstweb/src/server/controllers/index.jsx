import Router from 'koa-router'
import disposition from 'content-disposition'
import moment from 'moment';

import env from '../env'
import { combine, genFetchOptions, toJSON, catchException, uniformProxy, rebuildTreeData } from 'yxyweb/common/helpers/util'

import { getLoginUser } from './common';

const doFetch = function (url) {
  const options = genFetchOptions('get');
  return fetch(url, options)
    .then(toJSON, catchException)
    .then(json => {
      return {
        code: 200,
        data: json
      }
    })
}

const router = Router()

require('./user').default(router)
require('./meta').default(router)
require('./option').default(router)
require('./titleSetting').default(router)
require('./processGroup').default(router)
require('./tpllist').default(router)
require('./fileupload').default(router)
require('./ueditor').default(router)
require('./amap').default(router)
require('./sourceMap').default(router);

function renderPageContent(ctx, internals) {
  const pageInfo = {
    title: '友零售'
  }
  try {
    ctx.render(pageInfo, internals)
  } catch (e) {
    ctx.logger.error(e)
  }
}

router.get('/test/fetch', function (ctx) {
  const interMode = ctx.cookies.get('interMode');
  const { mode } = ctx.query;
  let redirectUrl = null;
  if (!interMode && mode) {
    ctx.cookies.set('interMode', mode, {
      path: '/',
      expires: new Date(Date.now() + 24 * 3600 * 1000),
      httpOnly: true
    });
    redirectUrl = mode === 'pc' ? '/portal' : '/billing'
  }
  ctx.body = {
    code: 200,
    data: { redirectUrl },
    message: '测试成功'
  };
});

router.get('/package/checkUpdate', function (ctx) {
  const { version } = ctx.query;
  const isUpdate = version === env.PACKAGE_VERSION ? false : true;
  ctx.body = {
    code: 200,
    data: {
      isUpdate,
      url: 'http://uretailtest.yonyoucloud.com/packages/uretail.apk'
    }
  };
});

router.get('/test', function (ctx) {
  ctx.render({
    title: '测试'
  });
})

router.get('/', async function (ctx) {
  const redirectUrl = (ctx.host.indexOf('yonyoucloud') === -1 && ctx.host.indexOf('yonyouup') === -1) ? '/portal' : '/index.html';
  ctx.redirect(ctx.entryPoint === 'touch' ? '/billing' : redirectUrl);
});

router.get('/portal', async function (ctx) {
  if (ctx.entryPoint === 'touch') {
    ctx.redirect('/billing');
    return;
  }
  const user = await getLoginUser(ctx);
  if (!user) {
    ctx.redirect('/login');
    return;
  }
  const url = env.HTTP_USER_FETCH_TREE.format(ctx.token, 1);
  const config = {
    url,
    method: 'POST'
  };
  const json = await uniformProxy(config);
  if (json.code !== 200) {
    ctx.logger.error(`获取树结构失败：【接口】${url} 【异常】${json.message}`)
    ctx.body = json;
    return;
  }
  json.data = json.data || [];
  const orgMenus = [], storeMenus = [];
  ctx.logger.error(ctx.entryPoint);
  rebuildTreeData(json.data, orgMenus, storeMenus);
  user.showOrg = orgMenus.length ? true : false;
  user.showStore = storeMenus.length ? true : false;
  const { device } = ctx.request.query;
  if (device)
    user.device = device;
  ctx.store.dispatch({
    type: 'PLATFORM_UI_USER_INIT',
    payload: user
  });
  ctx.store.dispatch({
    type: 'PLATFORM_UI_TREE_LOAD',
    TreeData: json.data
  });
  renderPageContent(ctx);
})

// 取文件
const FILE_ROUTE = '/files/*'

const parse = require('co-body');
router.post(FILE_ROUTE, function (ctx, next) {
  return parse.form(ctx).then(body => {
    ctx.request.body = body;
    return next();
  });
});

router.post(FILE_ROUTE, async function getFile(ctx) {
  const { req, res, request, path } = ctx
  const serviceUrl = combine(env.HTTP_SERVICE_BASEURL, req.url.substr(FILE_ROUTE.length - 1))
  const headers = {
    'content-type': env.HTTP_CONTENT_TYPE.JSON,
    // guard: 'response',
    // origin: 'koa2 server',
    cookie: req.headers.cookie
  }
  const data = typeof (request.body.json) == 'string' ? JSON.parse(request.body.json) : request.body.json
  const options = genFetchOptions(req.method, headers, data)

  ctx.logger.info(`参数：${request.body.json}`)

  await fetch(serviceUrl, options)
    .then(response => {
      if (response.status === 200) {
        const contentType = response.headers.get('Content-Type')
        const contentDisposition = response.headers.get('Content-Disposition')

        // if (contentType.indexOf('application/octet-stream') !== -1 &&
        if (contentDisposition != null) {
          ctx.type = contentType
          ctx.body = response.body
          ctx.attachment(disposition.parse(contentDisposition).parameters.filename)
        } else {
          return response.json()
        }
      } else {
        return {
          code: 500,
          message: response.body.text()
        }
      }
    }, e => {
      ctx.body = '文件打开出错'
    })
    .then(json => {
      if (!json) return
      if (json.data)
        json.data = env.HTTP_SERVICE_BASEURL + json.data
      ctx.body = json
    })
})

// router.post('/client/batchSubmit', async function (ctx) {
//   const { req, request } = ctx;
//   const mergeParams = request.body;
//   const results = [];
//   for (let i = 0, len = mergeParams.length; i < len; i++) {
//     const { requestUrl, requestMethod, requestData } = mergeParams[i];
//     const config = {
//       url: combine(env.HTTP_SERVICE_BASEURL, requestUrl),
//       method: requestMethod,
//       params: requestData
//     };
//     results.push(await uniformProxy(config));
//   }
//   ctx.body = { code: 200, data: results };
// });

router.post('/client/batchSubmit', async function (ctx) {
  const { req, request } = ctx;
  const mergeParams = request.body;
  const promises = [];
  for (let i = 0, len = mergeParams.length; i < len; i++) {
    const { requestUrl, requestMethod, requestData } = mergeParams[i];
    const config = {
      url: combine(env.HTTP_SERVICE_BASEURL, requestUrl),
      method: requestMethod,
      params: requestData
    };
    promises.push(uniformProxy(config));
  }
  const results = [];
  for (let i = 0, len = promises.length; i < len; i++)
    results.push(await promises[i]);
  ctx.body = { code: 200, data: results };
});

const UNIFORM_ROUTE = '/uniform/*'

router.get('/*bill/getPrintData', async function (ctx) {
  const { req, token } = ctx;
  const requestUrl = combine(env.HTTP_SERVICE_BASEURL, req.url) + `&token=${token}`;
  const config = {
    url: requestUrl,
    method: req.method,
    headers: {
      'content-type': env.HTTP_CONTENT_TYPE.JSON,
      origin: 'koa2 server',
      cookie: req.headers.cookie
    }
  }
  await uniformProxy(config)
    .then(json => {
      ctx.body = json;
    })
});

router.get('/uniform/iterativeUpdate/*', async function (ctx) {
  const { url, method, headers } = ctx.req;
  const requestUrl = combine(env.HTTP_UPDATELOG_SERVER, url.substr(UNIFORM_ROUTE.length - 1));
  const config = {
    url: requestUrl,
    method,
    headers: {
      'content-type': env.HTTP_CONTENT_TYPE.JSON,
      origin: 'koa2 server',
      cookie: headers.cookie
    }
  };
  await uniformProxy(config)
    .then(json => {
      ctx.body = json;
    });
});

const batchLogisticsRoute = '/uniform/batchLogistics';
router.post(batchLogisticsRoute, async function (ctx) {
  const { req, request } = ctx;
  const requestUrl = combine(env.HTTP_SERVICE_BASEURL, 'bill/getLogisticsInfo' + req.url.substr(batchLogisticsRoute.length));
  const config = {
    url: requestUrl,
    method: req.method,
    params: request.body
  };
  const json = await uniformProxy(config);
  const data = [];
  if (json.data && json.data.length) {
    for (let i = 0, len = json.data.length; i < len; i++) {
      const item = json.data[i];
      const { com, nu } = item;
      const returnItem = item;
      const serviceUrl = `http://express.yonyouup.com/api/trace?com=${com}&nu=${nu}`;
      const progressJson = await doFetch(serviceUrl);
      returnItem.progress = progressJson.data && progressJson.data.data || [];
      returnItem.progress.sort((a, b) => {
        return moment(a.time).isBefore(b.time) ? 1 : -1;
      });
      data.push(returnItem);
    }
  }
  ctx.body = { code: 200, data };
});

router.all(UNIFORM_ROUTE, async function doUniformHttpRequest(ctx) {
  const { req, request } = ctx;
  const requestUrl = combine(env.HTTP_SERVICE_BASEURL, req.url.substr(UNIFORM_ROUTE.length - 1));
  const config = {
    url: requestUrl,
    method: req.method,
    params: request.body,
    headers: {
      'content-type': env.HTTP_CONTENT_TYPE.JSON,
      origin: 'koa2 server',
      cookie: req.headers.cookie
    }
  }
  await uniformProxy(config)
    .then(json => {
      ctx.body = json;
    })
  return;
  const requestData = request.body;
  const headers = {
    'content-type': env.HTTP_CONTENT_TYPE.JSON,
    origin: 'koa2 server',
    cookie: req.headers.cookie
  }
  const options = genFetchOptions(req.method, headers, requestData)
  ctx.logger.info(`参数：${JSON.stringify(requestData)}`)
  await fetch(requestUrl, options)
    .then(toJSON, catchException)
    .then(json => {
      ctx.type = env.HTTP_CONTENT_TYPE.JSON
      ctx.body = json
      if (json.code === 500) {
        ctx.logger.error(`【接口】${requestUrl} 【异常】${json.message}`)
      } else {
        ctx.logger.info(`【接口】${requestUrl} 【数据】${JSON.stringify(json.data)}`)
      }
    })
})

router.post('/getMenuTree', async function (ctx) {
  const { token, terminalType } = ctx.query;
  const url = env.HTTP_USER_FETCH_TREE.format(token, terminalType);
  const options = genFetchOptions('post')

  await fetch(url, options)
    .then(toJSON, catchException)
    .then(json => {
      if (json.code === 500) {
        ctx.logger.error(`【接口】${url} 【异常】${json.message}`)
      }
      ctx.type = env.HTTP_CONTENT_TYPE.JSON
      ctx.body = json
    })
})

router.get('/login', function (ctx) {
  renderPageContent(ctx)
})
router.get('/register', function (ctx) {
  renderPageContent(ctx, false)
});
router.get('/wechat', function (ctx) {
  renderPageContent(ctx);
});
router.get('/forget', function (ctx) {
  renderPageContent(ctx, false)
})
router.get('/expire', function (ctx) {
  renderPageContent(ctx)
})
export default router
