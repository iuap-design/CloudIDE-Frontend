import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Immutable from 'immutable'
import { match } from 'react-router'

import cb from 'yxyweb/client/common/cube'

import 'yxyweb/common/helpers/polyfill'
import { Router } from '../common/redux/routes'
import { UretailAlert, UretailConfirm } from 'yxyweb/common/components/common/UretailNotice';
import Isomorph from '../common/helpers/Isomorph'
import { proxy } from 'yxyweb/common/helpers/util';
import routes from '../common/redux/routes'
import { init, logout } from '../common/redux/modules/user'

import 'yxyweb/client/styles/default'

cb.rest.nodeEnv = process.env.NODE_ENV;
cb.rest.terminalType = 1;

const finalState = {}
const {
  routing,
  ...reducers
} = window.__INITIAL_STATE__ || {}

if (reducers) {
  for (let p in reducers) {
    let reducer = reducers[p]
    finalState[p] = Immutable.fromJS(reducer)
  }
}

const rootElement = document.getElementById('container')
const { pathname, search, hash } = window.location
const location = `${pathname}${search}${hash}`

const store = Isomorph.createStore('index', finalState)
const history = Isomorph.createHistory(store, pathname)

const render = () => {
  // match({ routes, location }, (error, redirectLocation, renderProps) => {
  ReactDOM.render(
    <Isomorph store={store}>
      <Router history={history} />
    </Isomorph>,
    rootElement
  )
  // })
}

cb.utils.confirm = UretailConfirm();
cb.utils.alert = UretailAlert();

let hasRedirect = false;
cb.route.redirectLoginPage = (confirm) => {
  if (confirm === false) {
    store.dispatch(logout(history));
    return;
  }
  if (hasRedirect) return;
  hasRedirect = true;
  cb.utils.confirm('登录令牌失效，即将跳转登陆页面？', () => {
    store.dispatch(logout(history));
    hasRedirect = false;
  }, () => {
    // cb.utils.loadingControl.end();
    hasRedirect = false;
  });
}
cb.route.pushPage = (route) => {
  history.push(route);
}

if (navigator.userAgent.match(/(Android);?[\s\/]+([\d.]+)?/) || store.getState().user.toJS().device === 'test')
  cb.rest.device = 'android';

const config = {
  url: 'test/fetch',
  method: 'GET',
  options: { uniform: false, token: false }
};
if (window.Electron)
  config.params = { mode: 'touch' };
proxy(config)
  .then(json => {
    if (json.data && json.data.redirectUrl) {
      window.location.href = json.data.redirectUrl;
      return;
    }
    if (json.code === 500)
      cb.rest.mode = 'xhr';
    if (pathname !== '/login') {
      store.dispatch({ type: 'PLATFORM_UI_USER_INIT' });
      store.dispatch(init());
    }
    render();
  });
