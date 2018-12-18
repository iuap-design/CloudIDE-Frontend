import {match} from 'react-router'
import routes from '../../../common/redux/routes'

const routesMap = {
  index: routes
};

export default function () {
  return async function (ctx, next) {
    match({
      routes: routesMap[ctx.entryPoint],
      location: ctx.req.url
    }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        ctx.res.redirect(redirectLocation.pathname + redirectLocation.search)

      } else if (error) {
        console.error('ROUTER ERROR:', error)
        ctx.res.status(500)
        ctx.body = '500'

      } else if (renderProps) {
        // 交给后端 controller 处理

      } else {
        ctx.body = "404";
      }
    })

    await next()
  }
};
