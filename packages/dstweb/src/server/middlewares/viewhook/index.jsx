import React from 'react'
import ReactDOMServer from 'react-dom/server'
import beautify from 'js-beautify'

import html from './html'
import Isomorph from '../../../common/helpers/Isomorph'
import { Router as routes } from '../../../common/redux/routes'

const routesMap = {
  index: routes
};

const rebuildPaths = ['/', '/portal', '/register', '/wechat', '/forget', '/expire'];

const directNext = function (ctx) {
  if (rebuildPaths.indexOf(ctx.path) > -1
    || ctx.path.startsWith('/login')
    || ctx.path.startsWith('/billing')
    || ctx.path.startsWith('/meta')
    || ctx.path.startsWith('/echartcarousel'))
    return false;
  return true;
}

export default function viewhook(_options = { beautify: true, internals: true }) {
  const options = Object.assign({}, _options)

  return async function (ctx, next) {
    if (directNext(ctx)) {
      await next();
      return;
    }
    let isTouch = ctx.header['user-agent'].match(/(Android);?[\s\/]+([\d.]+)?/) || ctx.header['user-agent'].match(/(Electron);?[\s\/]+([\d.]+)?/) || ctx.path === '/billing/touch' || ctx.path === '/login/touch' || ctx.path === '/billing/second';
    const interMode = ctx.cookies.get('interMode');
    if (interMode) {
      if (isTouch && ctx.path === '/login') {
        isTouch = true;
        ctx.cookies.set('interMode', '', {
          path: '/',
          expires: new Date(Date.now() - 1),
          httpOnly: true
        });
      } else {
        isTouch = interMode === 'pc' ? false : true;
      }
    }
    if (ctx.path === '/billing/self' || ctx.path === '/login/self')
      ctx.entryPoint = 'self';
    else if (isTouch)
      ctx.entryPoint = 'touch';
    else if (ctx.path === '/billing')
      ctx.entryPoint = 'billing';
    else
      ctx.entryPoint = 'index';
    ctx.store = Isomorph.createStore(ctx.entryPoint)
    ctx.history = Isomorph.createHistory(ctx.store, ctx.path)
    ctx.render = function (pageInfo, internals = options.internals || true) {
      const render = internals
        ? ReactDOMServer.renderToString
        : ReactDOMServer.renderToStaticMarkup

      const RouterCom = routesMap[ctx.entryPoint];
      let markup = render(<Isomorph store={ctx.store}>
        <RouterCom history={ctx.history} />
      </Isomorph>)

      if (options.beautify) {
        markup = beautify.html(markup)
      }

      ctx.type = 'html';
      ctx.body = html(Object.assign({ entryPoint: ctx.entryPoint }, pageInfo), markup, ctx.store.getState())
    }

    await next()
  }
}
