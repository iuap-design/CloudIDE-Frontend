import env from '../../env'
import { combine, uniformProxy } from 'yxyweb/common/helpers/util';

export default function (routes) {
  return async function (ctx, next) {
    const { path, cookies, request } = ctx

    for (let item of env.AUTH_WHITELIST) {
      if (item instanceof RegExp) {
        if (item.test(path)) {
          return await next()
        }
      } else if (item === path) {
        return await next()
      }
    }
    const { yxyToken } = request.query;
    if (yxyToken) {
      const url = combine(env.HTTP_SERVICE_BASEURL, `user/loginByYxyToken?yxyToken=${yxyToken}`);
      const config = {
        url,
        method: 'GET'
      };
      const json = await uniformProxy(config);
      if (json.code === 200) {
        cookies.set('token', json.data.token, {
          path: '/',
          expires: new Date(Date.now() + 24 * 3600 * 1000),
          httpOnly: false
        });
        return await next();
      } else {
        ctx.logger.error(`根据yxyToken获取token失败：【接口】${url} 【异常】${json.message}`);
        ctx.body = json;
        return;
      }
    }
    const token = cookies.get('token');
    const redirectLogin = ctx => {
      if (ctx.is(env.HTTP_CONTENT_TYPE.JSON)) {
        ctx.body = {
          code: 900
        }
      } else {
        ctx.redirect('/login')
      }
    }
    if (token) {
      // token的有效性在页面controller校验
      ctx.token = token;
      try {
        return await next()
      } catch (e) {
        ctx.logger.error(`KOA2：controller程序内部错误（${e}）`)
      }
    } else if (request.query.token) {
      return await next()
    } else {
      redirectLogin(ctx)
    }
  }
};
