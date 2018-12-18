import Immutable from 'immutable';
import fetch from 'isomorphic-fetch';
import Cookies from 'cookies-js';
import moment from 'moment';

import ActionStatus from 'yxyweb/common/constants/ActionStatus';
import env from 'yxyweb/common/helpers/env';
import { toJSON, genAction, genFetchOptions, proxy } from 'yxyweb/common/helpers/util';
import { getMenuTree, clearMenu } from 'yxyweb/common/redux/tree';
import { addItem, clear } from 'yxyweb/common/redux/tabs';
import { getLayOut, clearLayOut } from './home';

const user = {
  usernameMsg: '',
  passwordMsg: '',
  errorMsg: '',
  id: null,
  username: '',
  password: '',
  corp_id: null,
  pubuts: null,
  bActivate: null,
  bEmailValid: null,
  bMobileValid: null,
  mobile: null,
  salt: null,
  iDeleted: null,
  bCorpRegister: false,
  dataSourceName: null,
  alias: null,
  token: null,
  accountCurrentKey: 'personalInfo',
  enableLogin: (process.env.NODE_ENV === 'development') ?
    true : false
};

const $$initialState = Immutable.fromJS({
  // 用户属性
  ...user,
  // 登陆状态
  loginStatus: ActionStatus.READY
});

export default (state = $$initialState, action) => {
  switch (action.type) {
    case 'PLATFORM_UI_USER_INIT':
      if (process.env.__CLIENT__) {
        const loginUserBackup = state.get('loginUserBackup');
        if (!loginUserBackup)
          return state;
        const loginUser = loginUserBackup.toJS();
        cb.rest.AppContext.tenant = loginUser.tenant;
        delete loginUser.tenant;
        cb.rest.AppContext.option = loginUser.option;
        delete loginUser.option;
        cb.rest.AppContext.user = loginUser;
        return state;
      }
      buildUser(action.payload);
      return state.merge(action.payload);
    case 'PLATFORM_DATA_USER_LOGIN':
      return state.set('loginStatus', ActionStatus.ING);
    case 'PLATFORM_DATA_USER_LOGIN_SUCCEED':
      buildUser(action.payload);
      return state
        .set('loginStatus', ActionStatus.SUCCEED)
        .set('errorMsg', '')
        .merge(action.payload);
    case 'PLATFORM_DATA_USER_LOGIN_FAILURE':
      return state
        .set('loginStatus', ActionStatus.FAILURE)
        .merge(action.payload);
    case 'PLATFORM_DATA_LOGIN_OUT':
      Cookies.expire('user');
      let nullData = {
        id: null,
        username: '',
        password: '',
        corp_id: null,
        pubuts: null,
        bActivate: null,
        bEmailValid: null,
        bMobileValid: null,
        mobile: null,
        salt: null,
        iDeleted: null,
        bCorpRegister: null,
        dataSourceName: null,
        alias: null,
        token: null,
      };
      return state
        .merge({ ...nullData, loginStatus: ActionStatus.READY });
    case 'PLATFORM_DATA_USER_ACCOUNT_SET_ACCOUNT_MSG':
      return state.merge(action.payload)
    case 'PLATFORM_DATA_USER_ACCOUNT_SET_ACCOUNT_ACTIVE_KEY':
      return state.set('accountCurrentKey', action.payload)
    case 'PLATFORM_DATA_USER_ACCOUNT_CHANGE_ORG':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_USER_ACCOUNT_CHANGE_STORE':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_USER_ACCOUNT_CHANGE_GRADE':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_USER_ACCOUNT_MERGE_INFO':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_CORP_SYSTEMSET_PASS_LOGO':
      return state.merge({ logo: action.payload });
    default:
      return state;
  }
}

const buildUser = (user) => {
  const { userOrgs, userStores, orgId, storeId } = user;
  let defaultOrgName, defaultStoreName;
  userOrgs && userOrgs.forEach(item => {
    if (item.org == orgId)
      defaultOrgName = item.org_name;
  });
  userStores && userStores.forEach(item => {
    if (item.store == storeId)
      defaultStoreName = item.store_name;
  })
  Object.assign(user, {
    defaultOrgName: defaultOrgName,
    defaultStoreName: defaultStoreName
  });
  user.loginUserBackup = JSON.parse(JSON.stringify(user));
};

export function usernameChange(value, usernameMsg) {
  return (dispatch) => {
    const obj = { username: value };
    if (value && usernameMsg)
      obj.usernameMsg = '';
    dispatch(genAction('PLATFORM_DATA_USER_LOGIN_FAILURE', obj));
  }
}

export function passwordChange(value, passwordMsg) {
  return (dispatch) => {
    const obj = { password: value };
    if (value && passwordMsg)
      obj.passwordMsg = '';
    dispatch(genAction('PLATFORM_DATA_USER_LOGIN_FAILURE', obj));
  }
}

const clearCache = () => {
  localStorage.removeItem('defaultGrade');
  localStorage.removeItem('billing_lastBill');
  localStorage.removeItem('billing_lastStatus');
  localStorage.removeItem('billing_lastBillId');
  localStorage.removeItem('billing_printTemplate');
}

//登录
export function login(data) {
  return async (dispatch) => {
    dispatch(genAction('PLATFORM_DATA_USER_LOGIN'));
    if (process.env.NODE_ENV !== 'development' || data.username) {
      let usernameMsg = null, passwordMsg = null;
      if (!data.username)
        usernameMsg = '登录账号不能为空';
      if (!data.password)
        passwordMsg = '密码不能为空';
      if (usernameMsg || passwordMsg) {
        dispatch(genAction('PLATFORM_DATA_USER_LOGIN_FAILURE', {
          usernameMsg,
          passwordMsg
        }));
        closeAwaitModal()
        return;
      }
    }
    else {
      data.username = 'xmcs001';
      data.password = '123456';
    }
    let config = {
      url: env.HTTP_USER_LOGIN,
      method: 'POST',
      options: { uniform: false, token: false },
      params: data
    };
    if (env.INTERACTIVE_MODE === 'touch') config.options.timeout = 3000
    let json = await proxy(config);

    if (json.code === 200) {

      localStorage.setItem('token', json.data.token);
      cb.rest.ContextBuilder.construct();

      if (json.data.leftTime == -1) {
        cb.route.pushPage('/expire');
        return
      }


      // localStorage.setItem('token', json.data.token);
      // cb.rest.ContextBuilder.construct();
      dispatch(afterLogin(data));
    } else {
      dispatch(genAction('PLATFORM_DATA_USER_LOGIN_FAILURE', { errorMsg: json.message }));
      console.error("错误代码：" + json.code + "错误信息：" + json.message);
    }
  }
}

export function afterLogin(data) {
  return async function (dispatch) {
    const callback = typeof data === 'function' ? data : null;
    let config = {
      url: 'user/getOrgsAndStores',
      method: 'GET',
    };
    let json = await proxy(config);
    if (json.code !== 200) {
      if (callback)
        callback();
      else
        dispatch(genAction('PLATFORM_DATA_USER_LOGIN_FAILURE', { errorMsg: json.message }));
      return;
    }

    cb.rest.AppContext.user = json.data;
    config = {
      url: 'tenant/find',
      method: 'GET',
    };
    json = await proxy(config);


    if (json.code === 200) {
      cb.rest.AppContext.user.logo = json.data.logo;
      cb.rest.AppContext.user.tenant = json.data;
    }
    if (env.INTERACTIVE_MODE !== 'touch' && env.INTERACTIVE_MODE !== 'self') {
      dispatch(genAction('PLATFORM_DATA_USER_LOGIN_SUCCEED', cb.rest.AppContext.user));
      if (cb.rest.terminalType === 3) {
        cb.route.replacePage('/');
      } else {
        cb.route.pushPage('/portal');
      }
    }
    if (json.code === 200)
      cb.rest.AppContext.tenant = json.data;
    // config = {
    //   url: 'option/getOptionData',
    //   method: 'POST',
    //   params: {
    //     optionId: 'sys_option'
    //   }
    // };
    // json = await proxy(config);
    // const option = {};
    // if (json.code === 200)
    //   Object.assign(option, json.data);
    // config = {
    //   url: 'option/getOptionData',
    //   method: 'POST',
    //   params: {
    //     optionId: 'business_option'
    //   }
    // };
    // json = await proxy(config);
    // if (json.code === 200)
    //   Object.assign(option, json.data);
    // cb.rest.AppContext.option = option;
    const showOptions = await getMenuTree(dispatch);
    Object.assign(cb.rest.AppContext.user, showOptions);
    dispatch(init(cb.rest.AppContext.user));
    if (!callback) {
      if (data) {
        if (data.rememberUser) {
          let rememberAccount = { username: data.username };
          localStorage.setItem('rememberAccount', JSON.stringify(rememberAccount));
        } else {
          if (localStorage.getItem('rememberAccount')) localStorage.removeItem('rememberAccount')
        }
        clearCache();
      }
    }
  }
}

const loadOption = async function () {
  const config = {
    url: 'option/getOptionsByParams',
    method: 'POST'
  };
  const json = await proxy(config);
  const option = {};
  if (json.code === 200) {
    json.data && json.data.forEach(item => {
      const { name, value } = item;
      option[name] = value;
    });
  }
  cb.rest.AppContext.option = option;
}

const afterStoreLoaded = function (showStore) {
  return async function (dispatch) {
    await loadOption();
    if (showStore !== false)
      dispatch(getGrades());
    if (cb.rest.terminalType !== 1) return;
    dispatch(addItem({
      key: 'PORTAL',
      title: '首页',
      closable: false,
      content: {
        type: 'platform',
        url: 'home'
      }
    }));
    dispatch(getLayOut());
  }
}

const getGrades = function () {
  return async function (dispatch) {
    const config = {
      url: 'billTemplateSet/getGradeAndEmployee',
      method: 'GET'
    }
    const json = await proxy(config);
    if (json.code !== 200) {
      cb.utils.alert(json.message, 'error');
      return;
    }
    const userGrades = json.data.gradeInfo;
    // if (!userGrades.length) return;
    dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_MERGE_INFO', { userGrades }));
    const defaultGrade = userGrades.find(item => {
      const { startTime, endTime } = item;
      if (startTime && endTime)
        return moment().isBetween(moment(startTime, 'HH:mm:ss'), moment(endTime, 'HH:mm:ss'));
      return false;
    });
    if (!defaultGrade) {
      cb.utils.alert('没有可用的班次', 'error');
      return;
    }
    dispatch(changeGrade(defaultGrade.id, defaultGrade.name));
  }
}

export function init(loginUser) {
  return function (dispatch, getState) {
    let { userOrgs, userStores, orgId, storeId, showOrg, showStore } = loginUser || getState().user.toJS();
    if (!userOrgs && !userStores && !orgId && !storeId && !showOrg && !showStore) return;
    let defaultOrg, defaultStore;
    if (showStore) {
      const cacheStore = localStorage.getItem('defaultStore');
      if (cacheStore && cacheStore != storeId) {
        if (cacheStore === 'null') {
          defaultStore = { store: null };
        } else {
          defaultStore = userStores.find(item => {
            return item.store == cacheStore;
          });
          if (defaultStore) {
            const relatedOrgId = defaultStore.org_id;
            if (!relatedOrgId)
              localStorage.setItem('defaultOrg', null);
            else if (relatedOrgId != (localStorage.getItem('defaultOrg') || orgId))
              localStorage.setItem('defaultOrg', relatedOrgId);
          } else {
            const stores = userStores.filter(item => {
              return item.store === storeId;
            });
            if (stores && stores.length) {
              const relatedOrgId = stores[0].org_id;
              if (!relatedOrgId)
                localStorage.setItem('defaultOrg', null);
              else if (relatedOrgId != (localStorage.getItem('defaultOrg') || orgId))
                localStorage.setItem('defaultOrg', relatedOrgId);
            } else if (userStores.length) {
              defaultStore = userStores[0];
              localStorage.setItem('defaultStore', defaultStore.store);
              const relatedOrgId = defaultStore.org_id;
              if (!relatedOrgId)
                localStorage.setItem('defaultOrg', null);
              else if (relatedOrgId != (localStorage.getItem('defaultOrg') || orgId))
                localStorage.setItem('defaultOrg', relatedOrgId);
            }
          }
        }
      } else {
        const stores = userStores.filter(item => {
          return item.store === storeId;
        });
        if (stores && stores.length) {
          const relatedOrgId = stores[0].org_id;
          if (!relatedOrgId)
            localStorage.setItem('defaultOrg', null);
          else if (relatedOrgId != (localStorage.getItem('defaultOrg') || orgId))
            localStorage.setItem('defaultOrg', relatedOrgId);
        } else if (userStores.length) {
          defaultStore = userStores[0];
          localStorage.setItem('defaultStore', defaultStore.store);
          const relatedOrgId = defaultStore.org_id;
          if (!relatedOrgId)
            localStorage.setItem('defaultOrg', null);
          else if (relatedOrgId != (localStorage.getItem('defaultOrg') || orgId))
            localStorage.setItem('defaultOrg', relatedOrgId);
        }
      }
    }
    if (showOrg || showStore) {
      const cacheOrg = localStorage.getItem('defaultOrg');
      if (cacheOrg && cacheOrg != orgId) {
        if (cacheOrg === 'null') {
          defaultOrg = { org: null };
        } else {
          defaultOrg = userOrgs.find(item => {
            return item.org == cacheOrg;
          });
          if (defaultOrg && showStore && !defaultStore) {
            const stores = userStores.filter(item => {
              return item.store === storeId;
            });
            if (stores && stores.length) {
              defaultStore = stores[0];
            } else if (userStores.length) {
              defaultStore = userStores[0];
              localStorage.setItem('defaultStore', defaultStore.store);
            }
          }
        }
      }
    }
    if (defaultOrg && defaultStore)
      return dispatch(_changeOrgAndStore(defaultOrg.org, defaultOrg.org_name, defaultStore.store, defaultStore.store_name));
    if (defaultOrg)
      return dispatch(changeOrg(defaultOrg.org, defaultOrg.org_name, true, showStore));
    if (defaultStore)
      return dispatch(changeStore(defaultStore.store, defaultStore.store_name, true));
    dispatch(afterStoreLoaded(showStore));
  }
}

export function billingInit() {
  return function (dispatch, getState) {
    dispatch(getGrades());
    return;
    const cacheGrade = localStorage.getItem('defaultGrade');
    if (!cacheGrade) return;
    const defaultGrade = JSON.parse(cacheGrade);
    dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_MERGE_INFO', defaultGrade));
  }
}

//登出
export function logout(router) {
  return (dispatch) => {
    // dispatch({
    //   type: 'PLATFORM_DATA_LOGIN_OUT',
    // })
    if (cb.rest.interMode !== 'touch') {
      Cookies.expire('token');
      localStorage.removeItem('token');
    }
    router.push('/login');
    dispatch(clearMenu());
    dispatch(clear());
    dispatch(clearLayOut());
  }
}

// 账户中心
export function setAccountMsg(value) {
  return (dispatch) => {
    dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_SET_ACCOUNT_MSG', value));
  }
}

export function setAccountActiveKey(value) {
  return (dispatch) => {
    dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_SET_ACCOUNT_ACTIVE_KEY', value));
  }
}

export function getLoginUser() {
  return function (dispatch) {
    const config = {
      url: 'user/getLoginUserByToken',
      method: 'GET'
    }
    proxy(config)
      .then(json => {
        if (json.code !== 200) return;
        dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_SET_INFO', json.data));
      });
  }
}

export function changeOrg(value, name, inner, showStore) {
  return function (dispatch, getState) {
    if (inner) {
      dispatch(_changeOrg(value, name, function () {
        dispatch(afterStoreLoaded(showStore));
      }));
    } else {
      cb.utils.confirm('确定要切换组织吗？该操作将重新刷新页面！', function () {
        dispatch(_changeOrg(value, name, function () {
          clearCache();
          const { userStores } = getState().user.toJS();
          const stores = userStores.filter(item => {
            return item.org_id === value;
          });
          if (stores && stores.length)
            localStorage.setItem('defaultStore', stores[0].store);
          else
            localStorage.setItem('defaultStore', null);
          location.reload();
        }));
      });
    }
  }
}

const _changeOrg = function (value, name, callback) {
  return function (dispatch) {
    const config = {
      url: 'user/changeOrgOrShop',
      method: 'POST',
      params: {
        orgId: value
      }
    }
    proxy(config)
      .then(json => {
        if (json.code !== 200) {
          cb.utils.alert(json.message, 'warning');
          return;
        }
        const info = { defaultOrgName: name, orgId: value };
        Object.assign(cb.rest.AppContext.user, info);
        dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_CHANGE_ORG', info));
        localStorage.setItem('defaultOrg', value);
        callback();
      });
  }
}

export function changeStore(value, name, inner) {
  return function (dispatch, getState) {
    if (inner) {
      dispatch(_changeStore(value, name, function () {
        dispatch(afterStoreLoaded());
      }));
    } else {
      if (cb.rest.terminalType == 3) {
        dispatch(_changeStore(value, name, function () {
          // dispatch(getGrades());
          // dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_STORE_CHANGED'));
          clearCache();
          const { userStores } = getState().user.toJS();
          const stores = userStores.filter(item => {
            return item.store === value;
          });
          if (stores && stores.length)
            localStorage.setItem('defaultOrg', stores[0].org_id);
          dispatch(afterLogin());
        }));
      } else {
        cb.utils.confirm('确定要切换门店吗？该操作将重新刷新页面！', function () {
          dispatch(_changeStore(value, name, function () {
            // dispatch(getGrades());
            // dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_STORE_CHANGED'));
            clearCache();
            const { userStores } = getState().user.toJS();
            const stores = userStores.filter(item => {
              return item.store === value;
            });
            if (stores && stores.length)
              localStorage.setItem('defaultOrg', stores[0].org_id);
            location.reload();
          }));
        });
      }
    }
  }
}

const _changeStore = function (value, name, callback) {
  return function (dispatch) {
    const config = {
      url: 'user/changeOrgOrShop',
      method: 'POST',
      params: {
        storeId: value
      }
    }
    proxy(config)
      .then(json => {
        if (json.code !== 200) {
          cb.utils.alert(json.message, 'warning');
          return;
        }
        const info = { defaultStoreName: name, storeId: value };
        Object.assign(cb.rest.AppContext.user, info);
        dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_CHANGE_STORE', info));
        localStorage.setItem('defaultStore', value);
        callback();
      });
  }
}

const _changeOrgAndStore = function (orgId, orgName, storeId, storeName) {
  return function (dispatch) {
    const config = {
      url: 'user/changeOrgOrShop',
      method: 'POST',
      params: {
        orgId,
        storeId
      }
    }
    proxy(config)
      .then(json => {
        if (json.code !== 200) {
          cb.utils.alert(json.message, 'warning');
          return;
        }
        const info = { defaultOrgName: orgName, orgId, defaultStoreName: storeName, storeId };
        Object.assign(cb.rest.AppContext.user, info);
        dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_MERGE_INFO', info));
        dispatch(afterStoreLoaded());
      });
  }
}

export function changeGrade(value, name) {
  return function (dispatch) {
    const gradeInfo = { defaultGradeName: name, gradeId: value };
    dispatch(genAction('PLATFORM_DATA_USER_ACCOUNT_CHANGE_GRADE', gradeInfo));
    localStorage.setItem('defaultGrade', JSON.stringify(gradeInfo));
  }
}

export function weChatLogin() {
  return function (dispatch) {
    let config = {
      url: '/weChat/getWechatQrCode',
      method: 'GET'
    }
    if (process.env.NODE_ENV === 'development')
      config.params = { debug: true };
    proxy(config)
      .then(json => {
        if (json.code !== 200) {
          cb.utils.alert(json.message, 'warning');
          console.error(json.message)
          return;
        }
        window.open(json.data, '_self');
      })
  }
}

export function switchInterMode(mode) {
  return async function (dispatch) {
    const config = {
      url: 'user/switchInterMode',
      method: 'GET',
      options: { uniform: false },
      params: { mode }
    };
    const json = await proxy(config);
    if (json.code !== 200) {
      cb.utils.alert(json.message);
      return;
    }
    location.href = json.data.redirectUrl;
  }
}

export function touchLogout() {
  return function (dispatch) {
    debugger
    cb.route.redirectLoginPage(false);
    dispatch({ type: 'PLATFORM_DATA_USER_ACCOUNT_SET_ACCOUNT_MSG', payload: { password: '' } })
    cb.events.execute('communication', { type: 'DUAL_SCREEN_CLEAR_SETTING' });
    dispatch({ type: 'PLATFORM_UI_BILLING_CLEAR' });
    dispatch({ type: 'PLATFORM_UI_BILLING_TOUCH_LOGOUT' });
  }
}

export function touchExit() {
  return function (dispatch) {
    if (typeof Electron === 'undefined') {
      dispatch(touchLogout())
    } else {
      Cookies.expire('token');
      // dispatch(clearMenu());
      // dispatch(clear());
      // dispatch(clearLayOut());
      // cb.events.execute('communication', {type: 'DUAL_SCREEN_CLEAR_SETTING'});
      // dispatch({type: 'PLATFORM_UI_BILLING_CLEAR'});
      // dispatch({type: 'PLATFORM_UI_BILLING_TOUCH_LOGOUT'});
      closeWindow();
    }
  }
}

function closeWindow() {
  setTimeout(function () {
    if (cb.utils.getCookie('token')) {
      closeWindow();
      return;
    }
    Electron.remote.getCurrentWindow().close();
  }, 1000);
}
