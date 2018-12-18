import path from 'path'
import Koa from 'koa'
import serve from 'koa-static'
import logger from 'koa-logger'
import compress from 'koa-compress'
import bodyParser from 'koa-bodyparser'
import chalk from 'chalk'


import viewhook from './middlewares/viewhook'
import matchRoute from './middlewares/matchRoute'
import auth from './middlewares/auth'
// import winston from './middlewares/winston'
import log4js from './middlewares/log4js';
import router from './controllers'
//import routes from '../common/redux/routes'
import env from './env'
import 'yxyweb/common/helpers/polyfill'

require('isomorphic-fetch')

new Koa()
  .use(log4js())
  .use(auth())
  .use(viewhook({ beautify: env.HTTP_HTML_BEAUTIFY }))
  // .use(matchRoute())
  // .use(winston())
  // .use(log4js())
  .use(logger())
  .use(compress())
  .use(bodyParser({ enableTypes: ['json'], jsonLimit: '10mb' }))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve(path.join(process.cwd(), 'static', 'public'), { maxage: 365 * 24 * 60 * 60 * 1000 }))
  .use(serve(path.join(process.cwd(), 'home')))
  .use(serve(path.join(process.cwd(), 'static'))) // , { maxage: 365 * 24 * 60 * 60 * 1000 }
  .listen(env.HTTP_SERVER_PORT)

console.log(chalk.blue(`listening on port ${env.HTTP_SERVER_PORT} -- ${process.env.NODE_ENV}`))
