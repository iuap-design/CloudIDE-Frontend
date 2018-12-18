import invariant from 'invariant'
import env from '../../env'

const isDev = process.env.NODE_ENV === 'development';
const baseUrl = env.HTTP_SCRIPT_BASEURL
const suffix = env.HTTP_SCRIPT_SUFFIX
const random = isDev ? '' : `?_=${env.STATIC_RANDOM_SUFFIX}`;

export default function html(pageInfo, content, state) {
  // 开发环境使用样式热更新, 不再用打包后的独立css文件
  const loadCss = isDev ? '' : `<link href="${baseUrl}/styles/default/${pageInfo.entryPoint}${suffix}.css${random}" rel="stylesheet" type="text/css" />`
  const yyyScript = isDev ? '' : `<script src="${baseUrl}/scripts/yonyou-yyy.js${random}"></script>`

  invariant(
    typeof pageInfo === 'object',
    `ctx.render函数的参数格式为：${JSON.stringify({
      title: 'html>head>title的值',
      keyword: 'html>head>keyword的值',
      description: 'html>head>description的值',
      baseUrl: '静态资源的根路径，如：http://localhost:3004/static/',
      content: 'ReactDOMServer.renderToString|renderToStaticMarkup输出的字符串',
      state: 'ctx.store.getState()',
    })}，可传入空对象。`
  )

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${pageInfo.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <link rel="shortcut icon" href="${baseUrl}/styles/default/images/bee.ico" type="images/x-icon">
      ${loadCss}
  </head>
  <body>
    <div id="container">${content}</div>
    <div id="popup-container"></div>


    <script>
      window.__INITIAL_STATE__ = ${JSON.stringify(state)}
    </script>
    ${yyyScript}
    <script src="${baseUrl}/scripts/vendor${suffix}.js${random}"></script>
    <script src="${baseUrl}/javascripts/${pageInfo.entryPoint}${suffix}.js${random}"></script>
    <script src="${baseUrl}/scripts/font.js${random}"></script>
    <script>
    (function(doc, win) {
      window.__fontUnit = 0
      var docEl = doc.documentElement,
        // resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
          recalc = function() {
            var clientWidth = docEl.clientWidth;
            var clientHeight = docEl.clientHeight;
              if (!clientWidth) return;
              if (clientWidth <= 1024 && clientHeight <= 600){
                window.__isElectronic = true;
                doc.body.className="electronic";
              } else {
                window.__isElectronic = false;
              }
              window.__isElectronicWidth = clientWidth
          };
          if (cb.rest.interMode === 'touch'){
            doc.body.className="touchDevice";
          }
      if (!doc.addEventListener) return;
      //   win.addEventListener(resizeEvt, recalc, false);
          doc.addEventListener('DOMContentLoaded', recalc, false);
      })(document, window);
    </script>
     <script>
      try {
        var Electron = require('electron')
         /*
        * return {Object}
        * */
        cb.electron.getSharedObject = function(key) {
          const sharedObj = Electron.remote.getGlobal('sharedObj');
          return key ? sharedObj[key] : sharedObj;
        }

        //Electron.remote.getGlobal('sendOrder')(order, data)


        cb.electron.sendOrder = function(order, data) {
          //Electron.ipcRenderer.send('electronicBalance-order', order, data)

          return new Promise(function(resolve) {
            // 为事件生成唯一ID
            const orderID = new Date().getTime()
            Electron.ipcRenderer.send('electronic-order', orderID, order, data)
            var callback = function(event, executedOrderID, result) {
               console.log(result)
               if (orderID === executedOrderID) {
                   Electron.ipcRenderer.removeListener('electronic-order-reply', callback)
                   resolve(result)
               }
            }
            Electron.ipcRenderer.addListener('electronic-order-reply', callback)
          })
        }
      } catch (e) {
      }
    </script>
    <script>
      cb.events.on('communication', function (args) {
        setTimeout(function() {
          if (cb.electron.getSharedObject()) {
            cb.electron.sendOrder('refreshSecondaryScreen', { type: 'billing', message: JSON.stringify(args) });
          }
        }, 1000);
      });
      function refreshSecondaryScreen(type,message) {
        if (type === 'login'){
          if(typeof message==='string' && message.constructor===String)
            message = JSON.parse(message);
          if(!message.token)
            message = {token:message,data:''};
          window.localStorage.setItem('token', message.token);
          cb.route.login(message.data);
        } else {
          try {
            message = JSON.parse(message);
            cb.route.dispatch(message);
          } catch (e) {
            cb.utils.alert(e.message);
          }
        }
      }
    </script>
  </body>
</html>`
}
