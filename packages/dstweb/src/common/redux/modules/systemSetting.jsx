
import Immutable from 'immutable';
import fetch from 'isomorphic-fetch';

import ActionStatus from 'yxyweb/common/constants/ActionStatus'
import env from 'yxyweb/common/helpers/env';
import { genAction, proxy } from 'yxyweb/common/helpers/util';

const $$initialState = Immutable.fromJS({
  logo: null,
  // companyInfo_errMsg: {nameErrMsg:null,aliasErrMsg:null,industryErrMsg:null,regionErrMsg:null,addressErrMsg:null,contactErrMsg:null,phoneErrMsg:null}
});

const clearState = Immutable.fromJS({});
export default (state = $$initialState, action) => {
  switch (action.type) {
    case 'PLATFORM_DATA_CORP_SYSTEMSET_COMPANY_INFO_MERGE':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_CORP_SYSTEMSET_UNMOUNT':
      return clearState;
    case 'PLATFORM_DATA_CORP_SYSTEMSET_GET_API':
      return state.set('apiInfo', action.payload);
    case 'PLATFORM_DATA_CORP_SYSTEMSET_COMPANY_INFO_SET_TAXID':
      return state.mergeDeepIn(['dataSource'], action.payload)
    default:
      return state;
  }
}

export function companyInfoMerge(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_SYSTEMSET_COMPANY_INFO_MERGE', value));
  }
}
export function passLogo(url) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_SYSTEMSET_PASS_LOGO', url))
  }
}
export function unMount() {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_SYSTEMSET_UNMOUNT'));
  }
}

export function getApi() {
  return function (dispatch) {
    const config = {
      url: 'apiUser/add',
      method: 'GET'
    }
    proxy(config)
      .then(json => {
        if (json.code !== 200) {
          cb.utils.alert(json.message, 'warning');
          return;
        }
        dispatch(genAction('PLATFORM_DATA_CORP_SYSTEMSET_GET_API', json.data));
      });
  }
}

export function openUdh() {
  return async function (dispatch) {
    const config = {
      url: 'register/openUdh',
      method: 'GET'
    };
    const json = await proxy(config);
    if (json.code !== 200) {
      cb.utils.alert(json.message, 'error');
      return;
    }
    dispatch(companyInfoMerge({ hasOpenUdh: true }));
  }
}

export function getTaxNo(name, callback){
  return async function(dispatch){
    let config = {
      url: 'tenant/getTaxNo',
      method: 'GET',
      params: {
        companyName: name
      }
    }
    let json = await proxy(config);
    if(json.code !== 200){
      cb.utils.alert(json.message, 'error');
      return 
    }
    if(callback){
      callback(json.data)
      return
    }
    dispatch(genAction('PLATFORM_DATA_CORP_SYSTEMSET_COMPANY_INFO_MERGE', {taxId: json.data}))
  }
}
