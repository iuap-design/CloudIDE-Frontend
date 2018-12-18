import { getLoginUser } from './common';
import { getMeta } from 'yxyweb/server/controllers/meta';

/**
 * 入口
 */
export default function (router) {
  router.post('/meta', async function (ctx) {
    await getMeta(ctx);
  })
  router.get('/meta/:menuId', function (ctx) {
    if (ctx.entryPoint === 'touch') {
      ctx.redirect('/billing');
      return;
    }
    ctx.render({
      title: ctx.params.menuId
    });
  })
  router.get('/meta/:billtype/:billno', function (ctx) {
    if (ctx.entryPoint === 'touch') {
      ctx.redirect('/billing');
      return;
    }
    ctx.render({
      title: ctx.params.billno
    });
  })
  router.get('/meta/:billtype/:billno/:billid', function (ctx) {
    if (ctx.entryPoint === 'touch') {
      ctx.redirect('/billing');
      return;
    }
    ctx.render({
      title: ctx.params.billno
    });
  })

  router.get('/echartcarousel', async function (ctx) {
    const user = await getLoginUser(ctx);
    if (!user) {
      ctx.redirect('/login');
      return;
    }
    ctx.store.dispatch({
      type: 'PLATFORM_UI_USER_INIT',
      payload: user
    });
    ctx.render({
      title: "大屏看板"
    });
  })

}
