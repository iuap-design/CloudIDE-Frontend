import Immutable from 'immutable';

import ActionStatus from 'yxyweb/common/constants/ActionStatus'
import { genAction, proxy } from 'yxyweb/common/helpers/util';

const $$initialState = Immutable.fromJS({
  current: 0,
  smsCodeStatus: ActionStatus.READY,
  getSmsCodeButtonEnabled: false,
  firstStepButtonEnabled: false,
  validCodeMsg: '',
  smsCodeMsg: '',
  agreeMsg: '',
  psdIsOpen: false,
  validPsd: '',
  psdErrorMsg: '',
  confirmPsdMsg: '',
  confirmPsd: '',
  phoneNumber: '',
  secondStepButtonAnabled: false,
});

export default (state = $$initialState, action) => {
  switch (action.type) {
    case 'PLATFORM_DATA_CORP_REG_SMS_CODE_STATUS':
      return state.set('smsCodeStatus', action.payload);
    case 'PLATFORM_DATA_CORP_REG_SET_BUTTON_ENABLED':
    case 'PLATFORM_DATA_CORP_REG_SET_MSG':
      return state.merge(action.payload);
    case 'PLATFORM_DATA_CORP_REG_SET_PHONE_NUMBER':
      return state.set('phoneNumber', action.payload)
    case 'PLATFORM_DATA_CORP_REG_NEXT':
      return state.set('current', state.get('current') + 1);
    case 'PLATFORM_DATA_USER_REG_SUCCEED':
      return state
        .merge({
          errorMsg: '注册完成，请开通企业账户',
          registered: true
        })
    case 'PLATFORM_DATA_CORP_REG_FAILED':
      return state.merge({ errorMsg: action.payload });
    case 'PLATFORM_DATA_CORP_REG_PSD_ISOPEN':
      return state.set('psdIsOpen', action.payload);
    case 'PLATFORM_DATA_CORP_REG_VALID_PSD':
      return state.merge({ validPsd: action.payload, psdErrorMsg: '' });
    case 'PLATFORM_DATA_CORP_REG_PSD_ERROR_MSG':
      return state.merge({ psdErrorMsg: 1, validPsd: '' });
    case 'PLATFORM_DATA_CORP_REG_CONFIRM_PSD':
      return state.set('confirmPsd', action.payload)
    case 'PLATFORM_DATA_CORP_REG_CONFIRM_PSD_MSG':
      return state.set('confirmPsdMsg', action.payload);
    case 'PLATFORM_DATA_CORP_REG_SECOND_STEP_BUTTON_ENABLED':
      return state.set('secondStepButtonAnabled', action.payload)
    case 'PLATFORM_DATA_CORP_REG_SET_ERROR_MSG':
      return state.merge(action.payload)
    case 'PLATFORM_DATA_REGISTER_SET_OPTIONS':
      return state.merge(action.payload)
    case 'PLATFORM_DATA_REGISTER_CLEAR':
      return $$initialState
    default:
      return state;
  }
}

export function setSmsCodeStatus(status) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SMS_CODE_STATUS', status));
  }
}

export function setButtonEnabled(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_BUTTON_ENABLED', value));
  }
}

export function setOptionChecked(checked) {
  return function (dispatch) {
    if (checked)
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { agreeMsg: '' }));
  }
}

export function setPhoneNumber(number) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_PHONE_NUMBER', number));
  }
}

export function getSmsCode(data) {
  return async function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SMS_CODE_STATUS', ActionStatus.ING));
    const config = {
      url: 'weChat/smsCodeExsitMobile',
      method: 'POST',
      params: data
    };
    const json = await proxy(config);
    if (json.code != 200) {
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SMS_CODE_STATUS', ActionStatus.FAILURE));
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { smsCodeMsg: json.message }));
    } else {
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SMS_CODE_STATUS', ActionStatus.SUCCESS));
    }
  }
}

export function checkSmsCode(data) {
  return async function (dispatch) {
    if (!data.agreement) {
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { agreeMsg: '请勾选' }));
      return;
    }
    const config = {
      url: 'weChat/bindExistUser',
      method: 'POST',
      params: data,
      options: { uniform: false }
    };
    const json = await proxy(config);
    if (json.code != 200) {
      dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_MSG', { agreeMsg: json.message }));
    } else {
      location.href = '/portal';
    }
  }
}

export function saveCorp(data) {
  return function (dispatch) {
    const options = genFetchOptions('post', data);
    fetch('/uniform/register/save', options)
      .then(function (response) {
        debugger;
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
          // dispatch(genAction('PLATFORM_DATA_CORP_REG_NEXT', json.message));
          alert(json.message)
        } else {
          dispatch(genAction('PLATFORM_DATA_CORP_REG_NEXT', json.message));
        }
      })
      .catch(function (ex) {
        return { code: 404, message: ex }
      })
  }
}

export function setPsdIsOpen(flag) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_PSD_ISOPEN', flag));
  }
}

export function setValidPsd(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_VALID_PSD', val));
  }
}

export function setPsdErrorMsg(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_PSD_ERROR_MSG', val));
  }
}

export function setConfirmPd(val) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_CONFIRM_PSD', val));
  }
}

export function setConfirmPsdMsg(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_CONFIRM_PSD_MSG', value));
  }
}

export function setSecondStepButtonEnabled(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SECOND_STEP_BUTTON_ENABLED', value));
  }
}

export function setErrorMsg(value) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_CORP_REG_SET_ERROR_MSG', value));
  }
}

export function getIndustry() {
  return function (dispatch) {
    let config = {
      url: 'enum/getIndustryEnumMap',
      method: 'GET',
      options: { token: false },
    }
    proxy(config)
      .then(json => {
        if (json.code === 200) {
          dispatch(genAction('PLATFORM_DATA_REGISTER_SET_OPTIONS', { industryDataSource: json.data }))
        } else if (json.code !== 200) {
          alert(json.message, 'error')
        }
      })
  }
}

export function checkRepeat(type, value) {
  return function (dispatch) {
    let config = {
      url: 'register/checkRegInfoExsit',
      method: 'GET',
      options: { token: false },
      params: {
        name: type,
        value: value,
      }
    }
    proxy(config)
      .then(json => {
        if (json.code === 200) {
          let dataSource = {}
          dataSource[`checkRepeat_${type}`] = ''
          dispatch(genAction('PLATFORM_DATA_REGISTER_SET_OPTIONS', dataSource))
        } else if (json.code !== 200) {
          let data = {};
          data[`checkRepeat_${type}`] = json.message
          dispatch(genAction('PLATFORM_DATA_REGISTER_SET_OPTIONS', data))
        }
      })
  }
}

export function setOptions(obj) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_REGISTER_SET_OPTIONS', obj))
  }
}

export function clear() {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_DATA_REGISTER_CLEAR'))
  }
}
