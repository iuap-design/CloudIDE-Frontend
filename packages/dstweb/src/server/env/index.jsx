import path from 'path'
import { combine } from 'yxyweb/common/helpers/util'
import chalk from 'chalk'

let localPath = 'localhost';
if (process.env.IP === 'true') {
  //获取本机ip
  let os = require('os');
  let ifaces = os.networkInterfaces();
  let ips = [];
  for (let dev in ifaces) {
    let alias = 0;
    ifaces[dev].forEach(function (details) {
      if (details.family == 'IPv4') {
        //console.log(dev+(alias?':'+alias:''),details.address);
        ips.push(details.address)
        ++alias;
      }
    });
  }

  localPath = ips[1];
}

const parseUrl = function (url) {
  if (!url)
    return url;
  if (url.substr(url.length - 1, 1) === '/')
    url = url.substr(0, url.length - 1);
  return url;
}

const HTTP_SERVICE_BASEURL = parseUrl(process.env.SRV_URL) || 'http://localhost:8080/uretail';
const HTTP_PRINT_SERVER = parseUrl(process.env.PRINT_SERVER) || 'http://localhost:8080/print_service';
const HTTP_UPDATELOG_SERVER = parseUrl(process.env.UPDATELOG_SERVER) || 'https://uretailserver.yonyoucloud.com/uretail';

const env = {
  PORTAL_LOG_DIR: path.join(process.cwd(), 'logs'),
  PORTAL_LOG_LEVEL: 'info',
  HTTP_SCRIPT_BASEURL: `http://${localPath}:${process.env.SCRIPT_PORT || 3004}/static`,
  HTTP_SCRIPT_SUFFIX: '',
  HTTP_SERVER_PORT: process.env.SERVER_PORT || 3003,
  HTTP_SERVICE_BASEURL,
  HTTP_PRINT_SERVER,
  HTTP_UPDATELOG_SERVER,
  HTTP_CONTENT_TYPE: {
    JSON: 'application/json',
    PDF: 'application/pdf',
    XLS: 'application/vnd.ms-excel',
    FORM: 'multipart/form-data'
  },
  // 关于用户的ajax接口
  HTTP_USER_AUTHENTICATION: combine(HTTP_SERVICE_BASEURL, '/user/login?terminaltype=PC'),
  HTTP_USER_REG_CORP: combine(HTTP_SERVICE_BASEURL, '/register/registerCorp'),
  HTTP_USER_CREATE_ACC: combine(HTTP_SERVICE_BASEURL, '/register/addCorpAccount'),
  HTTP_USER_VERIFYTOKEN: combine(HTTP_SERVICE_BASEURL, '/login/token?terminaltype=PC&token={0}'),
  HTTP_USER_FETCH_METABYMENU: combine(HTTP_SERVICE_BASEURL, '/billmeta/getbill'),
  HTTP_USER_FETCH_METABYBILLMAKER: combine(HTTP_SERVICE_BASEURL, '/makebillmeta/getBill'),
  HTTP_USER_FETCH_METABYBILLNO: combine(HTTP_SERVICE_BASEURL, '/menu/getMetaByMenu'),
  HTTP_USER_FETCH_TREE: combine(HTTP_SERVICE_BASEURL, '/menu/getMenuTree?token={0}&terminalType={1}'),
  HTTP_USER_FETCH_TREE_NODE: combine(HTTP_SERVICE_BASEURL, '/menu/getMetaByMenu'),
  HTTP_USER_FETCH_OPTIONMETA: combine(HTTP_SERVICE_BASEURL, '/option/getOptionMeta'),
  HTTP_USER_FETCH_OPTIONDATA: combine(HTTP_SERVICE_BASEURL, '/option/getOptionData'),
  HTTP_USER_FETCH_PROCESSMETA: combine(HTTP_SERVICE_BASEURL, '/billproc/vm'),
  HTTP_USER_FETCH_TPLLIST: combine(HTTP_SERVICE_BASEURL, '/billmeta/tpllist'),
  HTTP_USER_FETCH_BILLMETA: combine(HTTP_SERVICE_BASEURL, '/billmeta/group'),
  HTTP_USER_POST_BILLMETA: combine(HTTP_SERVICE_BASEURL, '/billmeta/groupset'),
  HTTP_USER_COR_ACC: combine(HTTP_SERVICE_BASEURL, '/login/getCorpAccounts'),//gen()
  HTTP_USER_ORG: combine(HTTP_SERVICE_BASEURL, '/login/getUserOrgs'),
  HTTP_USER_UPLOAD: combine(HTTP_SERVICE_BASEURL, '/pub/fileupload/upload'),
  HTTP_USER_UPLOAD2LOCAL: combine(HTTP_SERVICE_BASEURL, '/pub/fileupload/upload2Local'),
  HTTP_USER_VALIDCODE: combine(HTTP_SERVICE_BASEURL, '/register/validcode'),
  AUTH_WHITELIST: [
    '/',
    '/register',
    '/wechat',
    '/login',
    '/login/touch',
    '/login/self',
    '/logout',
    '/forget',
    '/expire',
    '/uniform/user/smscode',
    '/uniform/user/checksmscode',
    '/uniform/user/resetpwd',
    '/user/login',
    '/user/authorize',
    '/user/registercorp',
    '/user/getCorpAccounts',
    '/user/getUserOrgs',
    '/register/validcode',
    '/uniform/register/smscode',
    '/uniform/register/checksmscode',
    '/uniform/register/save',
    '/uniform/register/checkRegInfoExsit',
    '/uniform/enum/getIndustryEnumMap',
    '/uniform/tenant/getTaxNo',
    '/uniform/weChat/getWechatQrCode',
    '/weChat/callback',
    '/weChat/callbacktest',
    '/uniform/weChat/smsCodeExsitMobile',
    '/weChat/bindExistUser',
    '/meta/voucherlist/aa_productlist',
    '/test/fetch',
    '/package/checkUpdate',
    '/thirdparty/check',
    '/discount',
    '/billing/second',
    new RegExp('/sourcemap/*'),
    new RegExp('/demo/*'),
    /\.(html|js|css|png|gif|jpg|ico|map|apk|crt)$/,
  ],
}

if (process.env.NODE_ENV === 'production') {
  let version, packageVersion;
  try {
    version = require('../../version.json').version;
  } catch (e) {
    version = '';
  }
  try {
    packageVersion = require('../../package.version.json').version;
  } catch (e) {
    packageVersion = '';
  }
  Object.assign(env, {
    PORTAL_LOG_LEVEL: 'error',
    HTTP_SCRIPT_BASEURL: '',
    HTTP_SCRIPT_SUFFIX: '.min',
    STATIC_RANDOM_SUFFIX: version,
    PACKAGE_VERSION: packageVersion
  })
}
console.log(chalk.red.bold('局域网可访问地址 >>>>>>>>>>> http://' + localPath + ':' + env.HTTP_SERVER_PORT));
console.log(chalk.blue.bold('服务器接口地址 >>>>>>>>>>> ' + env.HTTP_SERVICE_BASEURL));

export default env
