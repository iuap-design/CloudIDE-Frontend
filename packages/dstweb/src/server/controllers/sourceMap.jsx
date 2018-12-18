import uuid from 'uuid';

const user = { fangqg: '123456' };
const tokens = [];

export default function (router) {
  router.get('/sourcemap/:name/:pwd', function (ctx) {
    const { name, pwd } = ctx.params;
    if (user[name] !== pwd) {
      ctx.cookies.set('sourceMapToken', '', {
        path: '/',
        expires: new Date(Date.now() - 1),
        httpOnly: true
      });
      ctx.body = { code: 999, message: '调试用户校验失败' };
    } else {
      const token = uuid();
      tokens.push(token);
      ctx.cookies.set('sourceMapToken', token, {
        path: '/',
        expires: new Date(Date.now() + 24 * 3600 * 1000),
        httpOnly: true
      });
      ctx.body = { code: 200, message: '调试用户校验成功' };
    }
  });

  router.get('/scripts/*.min.js.map', async function (ctx, next) {
    const token = ctx.cookies.get('sourceMapToken');
    if (tokens.indexOf(token) === -1) {
      ctx.throw(400, '调试用户校验失败');
      return;
    }
    await next();
  });
}
