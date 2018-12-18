import fs from 'fs';
import log4js from 'log4js';
import env from '../../env';

var defaultConfig = require('./defaultConfig');
var connectLogger = require('./connect-logger');

fs.existsSync(env.PORTAL_LOG_DIR) || fs.mkdirSync(env.PORTAL_LOG_DIR);

log4js.configure(defaultConfig);

var logger = log4js.getLogger('uretail');
logger.setLevel('INFO');

export default function () {
  return async function (ctx, next) {
    var start = new Date();
    const { req, res } = ctx;
    res.on('finish', function () {
      res.responseTime = new Date() - start;
      connectLogger(logger, req, res);
    });
    ctx.logger = logger;
    await next();
  }
}
