var levels = require('log4js/lib/levels');
var DEFAULT_FORMAT = ':remote-addr - -' +
  ' ":method :url HTTP/:http-version"' +
  ' :status :response-timems :content-lengthb ":referrer"' +
  ' ":user-agent"';

function getLogger(logger, req, res) {
  var level = levels.INFO;
  if (res.statusCode) {
    if (res.statusCode >= 300) level = levels.WARN;
    if (res.statusCode >= 400) level = levels.ERROR;
  }
  logger.log(level, format(DEFAULT_FORMAT, assemble_tokens(req, res)));
}

function assemble_tokens(req, res, custom_tokens) {
  var default_tokens = [];
  default_tokens.push({ token: ':url', replacement: getUrl(req) });
  default_tokens.push({ token: ':protocol', replacement: req.protocol });
  default_tokens.push({ token: ':hostname', replacement: req.hostname });
  default_tokens.push({ token: ':method', replacement: req.method });
  default_tokens.push({ token: ':status', replacement: res.__statusCode || res.statusCode });
  default_tokens.push({ token: ':response-time', replacement: res.responseTime });
  default_tokens.push({ token: ':date', replacement: new Date().toUTCString() });
  default_tokens.push({
    token: ':referrer',
    replacement: req.headers.referer || req.headers.referrer || ''
  });
  default_tokens.push({
    token: ':http-version',
    replacement: req.httpVersionMajor + '.' + req.httpVersionMinor
  });
  default_tokens.push({
    token: ':remote-addr',
    replacement:
    req.headers['x-forwarded-for'] ||
    req.ip ||
    req._remoteAddress ||
    (req.socket &&
      (req.socket.remoteAddress ||
        (req.socket.socket && req.socket.socket.remoteAddress)
      )
    )
  });
  default_tokens.push({ token: ':user-agent', replacement: req.headers['user-agent'] });
  default_tokens.push({
    token: ':content-length',
    replacement:
    (res._headers && res._headers['content-length']) ||
    (res.__headers && res.__headers['Content-Length']) ||
    '-'
  });
  default_tokens.push({
    token: /:req\[([^\]]+)\]/g, replacement: function (_, field) {
      return req.headers[field.toLowerCase()];
    }
  });
  default_tokens.push({
    token: /:res\[([^\]]+)\]/g, replacement: function (_, field) {
      return res._headers ?
        (res._headers[field.toLowerCase()] || res.__headers[field])
        : (res.__headers && res.__headers[field]);
    }
  });
  return default_tokens;
}

function getUrl(req) {
  return req.originalUrl || req.url;
}

function format(str, tokens) {
  for (var i = 0; i < tokens.length; i++) {
    str = str.replace(tokens[i].token, tokens[i].replacement);
  }
  return str;
}

module.exports = getLogger;
