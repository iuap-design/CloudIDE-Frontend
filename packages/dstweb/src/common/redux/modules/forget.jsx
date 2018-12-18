/**
 ** 2016-11-24 zhangmyh
 * 建立文件
 */
import Immutable from 'immutable';
import fetch from 'isomorphic-fetch';

import ActionStatus from 'yxyweb/common/constants/ActionStatus'
import env from 'yxyweb/common/helpers/env';
import { toJSON, genAction, genFetchOptions, proxy } from 'yxyweb/common/helpers/util';

const $$initialState = Immutable.fromJS({
  current: 0,
  smsCodeStatus: ActionStatus.READY,
  //   getSmsCodeButtonEnabled: false,
  //   firstStepButtonEnabled: false,
  //   validCodeMsg: '',
  smsCodeValue: '',
  smsCodeMsg: '',
  //   agreeMsg: '',
  psdIsOpen: false,
  validPsd: '',
  psdErrorMsg: '',
  confirmPsdMsg: '',
  confirmPsd: '',
  phoneNumber: '',
  phoneMsg: false
});

export default (state = $$initialState, action) => {
  switch (action.type) {
    case 'PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS':
      return state.set('smsCodeStatus', action.payload);
    case 'PLATFORM_DATA_CORP_FORGET_SET_SMS_CODE_VALUE':
      return state.set('smsCodeValue', action.payload);
    // case 'PLATFORM_DATA_CORP_REG_SET_BUTTON_ENABLED':
    case 'PLATFORM_DATA_CORP_FORGET_SET_MSG':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_CORP_FORGET_SET_PHONE_NUMBER':
      return state.set('phoneNumber', action.payload)
    case 'PLATFORM_DATA_CORP_FORGET_NEXT':
      return state.set('current', state.get('current') + 1);
    // case 'PLATFORM_DATA_USER_REG_SUCCEED':
    //   return state
    //     .merge({
    //       errorMsg: '注册完成，请开通企业账户',
    //       registered: true
    //     })
    // case 'PLATFORM_DATA_CORP_REG_FAILED':
    //   return state.merge({ errorMsg: action.payload });
    case 'PLATFORM_DATA_CORP_FORGET_PSD_ISOPEN':
      return state.set('psdIsOpen', action.payload);
    case 'PLATFORM_DATA_CORP_FORGET_VALID_PSD':
      return state.merge({ validPsd: action.payload, psdErrorMsg: '' });
    case 'PLATFORM_DATA_CORP_FORGET_PSD_ERROR_MSG':
      return state.merge({ psdErrorMsg: 1, validPsd: '' });
    case 'PLATFORM_DATA_CORP_FORGET_CONFIRM_PSD':
      return state.set('confirmPsd', action.payload)
    case 'PLATFORM_DATA_CORP_FORGET_CONFIRM_PSD_MSG':
      return state.set('confirmPsdMsg', action.payload);
    case 'PLATFORM_DATA_CORP_FORGET_RESET_PHONE':
      return state.set('resetPhone', action.payload);
    case 'PLATFORM_DATA_CORP_FORGET_UNMOUNT':
      return $$initialState;
    case 'PLATFORM_DATA_CORP_FORGET_SET_OPTIONS':
      return state.merge(action.payload)
    default:
      return state;
  }
}

export function setSmsCodeStatus(status) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', status));
  }
}

// export function setButtonEnabled(value) {
//   return function (dispatch) {
//     dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_BUTTON_ENABLED', value));
//   }
// }

// export function setOptionChecked(checked) {
//   return function (dispatch) {
//     if (checked)
//       dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { agreeMsg: '' }));
//   }
// }

export function setPhoneNumber(number) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_PHONE_NUMBER', number));
  }
}

export function setSmsCodeValue(number) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_SMS_CODE_VALUE', number));
  }
}

export function getSmsCode(data) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.ING));
    const options = genFetchOptions('post', data);
    fetch('/uniform/user/smscode', options)
      .then(function (response) {
        if (response.status >= 400) {
          return {
            code: response.status,
            message: response.url + response.statusText,
            response: response
          };
        }
        return response.json();
      })
      .then(function (json) {
        if (json.code != 200) {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.FAILURE));
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { smsCodeMsg: json.message }));
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.SUCCESS));
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function checkSmsCode(data) {
  return function (dispatch) {
    // if (!data.agreement) {
    //   dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { agreeMsg: '请勾选' }));
    //   return;
    // }
    const options = genFetchOptions('post', data);
    fetch('/uniform/user/checksmscode', options)
      .then(function (response) {
        if (response.status >= 400) {
          return {
            code: response.status,
            message: response.url + response.statusText,
            response: response
          };
        }
        return response.json();
      })
      .then(function (json) {
        if (json.code != 200) {
          // dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { agreeMsg: json.message }));
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_NEXT', json.message));
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function saveCorp(data) {
  return function (dispatch) {
    const options = genFetchOptions('post', data);
    fetch('/uniform/user/resetpwd', options)
      .then(function (response) {
        if (response.status >= 400) {
          return {
            code: response.status,
            message: response.url + response.statusText,
            response: response
          };
        }
        return response.json();
      })
      .then(function (json) {
        if (json.code != 200) {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_NEXT', json.message));
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_NEXT', json.message));
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function setPsdIsOpen(flag) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_PSD_ISOPEN', flag));
  }
}

export function setValidPsd(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_VALID_PSD', val));
  }
}

export function setPsdErrorMsg(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_PSD_ERROR_MSG', val));
  }
}

export function setConfirmPd(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_CONFIRM_PSD', val));
  }
}

export function setConfirmPsdMsg(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_CONFIRM_PSD_MSG', value));
  }
}

export function setMsg(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', value));
  }
}

//修改手机号 accountModal
export function unMount() {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_FORGET_UNMOUNT'));
  }
}

export function getResetPhoneSmsCode(data) {
  return function (dispatch) {
    // dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.ING));
    const options = genFetchOptions('get');
    let context = cb.rest.AppContext;
    fetch(`/uniform/user/sendsms/${data.phone}?token=${context.token}`, options)
      .then(function (response) {
        if (response.status >= 400) {
          return {
            code: response.status,
            message: response.url + response.statusText,
            response: response
          };
        }
        return response.json();
      })
      .then(function (json) {
        if (json.code != 200) {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.FAILURE));
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { smsCodeMsg: json.message }));
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SMS_CODE_STATUS', ActionStatus.SUCCESS));
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function checkResetPhoneSmsCode(data) {
  return function (dispatch) {
    const options = genFetchOptions('post', data);
    let context = cb.rest.AppContext;
    // dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { agreeErrorMsg: '' }));
    fetch(`/uniform/user/resetphone?token=${context.token}`, options)
      .then(function (response) {
        // dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { agreeErrorMsg: response.message }));
        if (response.status >= 400) {
          return {
            code: response.status,
            message: response.url + response.statusText,
            response: response
          };
        }
        return response.json();
      })
      .then(function (json) {
        if (json.code != 200) {
          // dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { agreeErrorMsg: json.message }));
          cb.utils.alert(`${json.message}`, 'error');
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_RESET_PHONE', data.phone));
          dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_MSG', { visible: false, phoneNumber: '', phoneMsg: false, smsCodeMsg: '', smsCodeStatus: ActionStatus.READY }));
          cb.utils.alert('修改成功!', 'success');
          console.log(json, json.message)
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function save(obj, form) {
  return async function(dispatch){
    let config = {
      url: '/user/changepwd',
      method: 'POST',
      params: {
        password: obj.old_password,
        newPassword: obj.password
      }
    }
    let josn = await proxy(config);
    if(josn.code!==200){
      dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_OPTIONS', {saveErrMsg: josn.message}));
      console.error(josn.message)
    }else{
      dispatch(genAction('PLATFORM_DATA_CORP_FORGET_SET_OPTIONS', {saveErrMsg: null, validPsd: '', confirmPsd: ''}));
      // form.setFieldsValue({old_password: '', password: '', password_confirm: ''})
      form.resetFields()
      cb.utils.alert('修改密码成功！', 'success')
    }
  }
}
