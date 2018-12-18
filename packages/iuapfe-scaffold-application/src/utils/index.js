import ReactDOM from 'react-dom';
import {Message} from 'tinper-bee';
import axios from "axios";


export const success = (msg) => {
    Message.create({content: msg, color: 'success', duration: 3});
}

export const Error = (msg) => {
    Message.create({content: msg, color: 'danger'});
}

export const Warning = (msg) => {
    Message.create({content: msg, color: 'warning', duration: 3});
}

export const Info = (msg) => {
    Message.create({content: msg, color: 'info', duration: 3});
}
/**
 * 数据返回统一处理函数
 * @param {*} response
 * @param {*} successMsg 成功提示
 */
export const processData = (response, successMsg) => {
    if (typeof response != 'object') {
        Error('数据返回出错：1、请确保服务运行正常；2、请确保您的前端工程代理服务正常；3、请确认您已在本地登录过应用平台');
        throw new Error('数据返回出错：1、请确保服务运行正常；2、请确保您的前端工程代理服务正常；3、请确认您已在本地登录过应用平台')
    }
    if (response.status == '401') {
        Error(`错误:${(response.data.msg)}`);
        throw new Error(`错误:${(response.data.msg)}`);
    }
    if (response.status == '200') {
        let data = response.data;
        let repMsg = data.success;
        if (repMsg == 'success') {
            if (successMsg) {
                success(successMsg);
            }
            return data.detailMsg.data;
        } else if (repMsg == 'fail_field') {
            Error(`错误:${(data && data.detailMsg && convert(data.detailMsg.msg)) || '数据返回出错'}`);
            throw new Error(`错误:${(data && data.detailMsg && convert(data.detailMsg.msg)) || '数据返回出错'}`)
        } else {
            Error(`错误:${convert(data.message)}`);
            throw new Error(`错误:${convert(data.message)}`);
        }
    } else {
        Error('请求错误');
    }
}

/**
 * param拼接到url地址上
 * @param {*} url
 * @param {*} params
 * @param {*} prefix
 */
export const paramToUrl = (url, params, prefix) => {
    if (!prefix) prefix = '';
    if (url.indexOf('?') == -1) {
        url += '?r=' + Math.random();
    }
    for (let attr in params) {
        if ((attr == 'pageIndex') || (attr == 'pageSize')) {
            url += '&' + attr + '=' + params[attr];
        } else {
            url += '&' + prefix + attr + '=' + params[attr];
        }
    }
    return url;
}

/**
 * json转换指定的前缀
 * @param {JSON} json
 * @param {JSON} prefix
 */
export const jsonToUrl = (json, prefix = "search_") => {
    let obj = {};
    for (let attr in json) {
        if ((attr == 'pageIndex') || (attr == 'pageSize')) {
            obj[`${attr}`] = json[attr];
        } else {
            obj[`${prefix}${attr}`] = json[attr];
        }
    }
    return obj;
}

// 后台乱码转换
export const convert = (text) => {
    let element = document.createElement("p");
    element.innerHTML = text;
    let output = element.innerText || element.textContent;
    element = null;
    return output;
}

export const setCookie = (name, value, options) => {

    options = options || {};
    if (value === null) {
        value = '';
        options.expires = -1;
    }
    let expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
        let date;
        if (typeof options.expires == 'number') {
            date = new Date();
            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
            date = options.expires;
        }
        expires = '; expires=' + date.toUTCString();
    }
    let path = options.path ? '; path=' + options.path : '';
    let domain = options.domain ? '; domain=' + options.domain : '';
    let s = [cookie, expires, path, domain, secure].join('');
    let secure = options.secure ? '; secure' : '';
    let c = [name, '=', encodeURIComponent(value)].join('');
    let cookie = [c, expires, path, domain, secure].join('')
    document.cookie = cookie;

}

export const getCookie = (name) => {

    let cookieValue = null;
    if (document.cookie && document.cookie != '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    // 按照总设部规范，调整为下划线
    if (typeof cookieValue != 'undefined' && cookieValue != null) {
        cookieValue = cookieValue.replace(/-/, "_");
    }
    return cookieValue;
}


/**
 * 生成唯一字符串
 */
export function uuid() {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i += 1) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = '-';
    s[13] = '-';
    s[18] = '-';
    s[23] = '-';
    return s.join('');
}

/**
 * 将object中value是字符串的转成Number
 *
 */
export function objStringToNumber(obj) {
    if (Array.isArray(obj)) {
        for (let [index, childItem] of obj) {
            if (typeof childItem === 'object') {
                return objStringToNumber(childItem);
            } else {
                if ((typeof childItem !== 'number')) {
                    const temp = Number(childItem);
                    if (temp) return obj[index] = temp;
                }
            }
        }

    } else {
        for (const item in obj) {
            if (typeof obj[item] === 'object') {
                objStringToNumber(obj[item]);
            } else {
                if (obj[item] && (typeof obj[item] !== 'number')) {
                    const temp = Number(obj[item]);
                    if (temp) obj[item] = temp;
                }
            }
        }
    }
    return obj;
}


/**
 * 导出excel 后端导出，通过post方式
 *
 */
export function exportExcelPost(url, data) {
    axios({
        method: 'post',
        url: url,
        data: data,
        responseType: 'blob'
    }).then((res) => {
        const content = res.data;
        const blob = new Blob([content]);
        const fileName = "导出数据.xls";
        const selfURL = window[window.webkitURL ? 'webkitURL' : 'URL'];
        let elink = document.createElement('a');
        if ('download' in elink) {
            elink.download = fileName;
            elink.style.display = 'none';
            elink.href = selfURL['createObjectURL'](blob);
            document.body.appendChild(elink);

            // 触发链接
            elink.click();
            selfURL.revokeObjectURL(elink.href);
            document.body.removeChild(elink)
        } else {
            navigator.msSaveBlob(blob, fileName);
        }
    })
}


/**
 *
 * @description 树节点添加子数据
 * @export
 * @param {array} [parentArray=[]]
 * @param {array} [childArray=[]]
 * @returns
 */
export function addChild(parentArray = [], childArray = []) {

    let parentLen = parentArray.length;
    if (parentLen == 0 || childArray.length == 0) {
        return [];
    }
    let parentId = childArray[0].parentId;

    for (let i = 0; i < parentLen; i++) {
        let item = parentArray[i];
        if (item.id === parentId) {
            item['isSon'] = 2;
            let newChildren = [];
            if (Array.isArray(item['children'])) {
                let isObtain = item['children'].some(item => {
                    return item['id'] == (childArray.length && childArray[0]['id']);
                });

                if (!isObtain) {
                    newChildren = deepClone(item['children']).concat(childArray);
                } else {
                    newChildren = deepClone(item['children']);
                }

            } else {
                newChildren = childArray;
            }
            /* let newChildren = (typeof item['children'] === 'undefined' && !item['children']) ? childArray : deepClone(item['children']).concat(childArray);
            item['children'] = newChildren; */
            item['children'] = newChildren;
            break;
        } else {
            let temp = item['children'];
            if (typeof temp !== 'undefined' && Array.isArray(temp) && temp.length) {
                console.log("item['children']", item['children']);
                setTimeout(function () {
                    addChild(item['children'], childArray);
                }, 0);

            }
        }
    }

    return parentArray;
}

// 处理子节点,type为0 表示查找; type为1 表示删除
export function handleChild(parentArray, child, type) {
    let parentLen = parentArray.length,
        resChild = {};
    // isDelete = false;

    for (let i = 0; i < parentLen; i++) {
        let item = parentArray[i];
        if (item.id == child.id) {
            if (type === 0) {
                resChild = item;
                return resChild;
            } else {
                parentArray.splice(i, 1);
                return true;
            }
        } else {
            if (typeof item['children'] !== 'undefined') {
                resChild = handleChild(item['children'], child, type);

                // 查找节点
                if (type == 0 && (Object.keys(resChild).length > 0)) {
                    return resChild;
                }

                if (type === 1 && typeof resChild === 'boolean' && resChild) {
                    if (!item['children'].length) {
                        item['isSon'] = 1;
                    }
                }

            }
        }
    }

    return resChild;
}


// 数组深克隆
export function deepClone(data) {
    return JSON.parse(JSON.stringify(data));
}

/**
 * 后端数据附加key
 * @param {*} arrayobject
 */
export function resultDataAdditional(arrayobject) {
    if (Array.isArray(arrayobject)) {
        return Array.from(arrayobject, (x, i) => ({...x, key: i}))

    } else {
        return [];
    }
}


/**
 * 深度 obj 合并
 * const a = {a: 1, b: 2, c: 3, d: {key: 2, value: 4}, e: [1, 2, 3]};
 * const b = {a: 3, d: {key:4}, e: [4, 5]};
 * 1. 如果值为{},则覆盖
 * 2. 如果数组全覆盖
 * 3 否则深度
 * @param def
 * @param obj
 * @returns {*}
 */
export function deepAssign(preData, nextData) {
    for (const preKey in preData) {
        const preChildrenKeys = Object.keys(preData[preKey]);
        let nextChildrenKeys = 0;
        if (nextData[preKey] && !Array.isArray(preData[preKey])) {
            nextChildrenKeys = Object.keys(nextData[preKey]);
        }
        if (preChildrenKeys.length > 0 && nextChildrenKeys.length > 0) {
            deepAssign(preData[preKey], nextData[preKey]);
        } else {
            const tempNextValue = nextData[preKey];
            if (tempNextValue !== undefined) {
                preData[preKey] = tempNextValue;
            }
        }
    }
    return preData;
}

/**
 * 对请求回来带有分页的数据 解构，拼装
 * @param obj
 * @param param
 * @returns {{list: *, pageIndex: *, totalPages: *, total: *, pageSize: *}}
 */
export function structureObj(obj, param) {
    const {content, number, totalPages, totalElements, size} = obj;
    let {pageSize} = param;
    if (!pageSize) {
        pageSize = size;
    }
    return {
        list: content,
        pageIndex: number + 1,
        totalPages: totalPages,
        total: totalElements,
        pageSize,// 结构请求的pageSize,
    };

}

/**
 * 初始化 state 里的带有分页的 obj
 * @param obj
 * @returns {{list: Array, pageIndex: number, totalPages: number, total: number, pageSize: *}}
 */
export function initStateObj(obj) {
    const {pageSize} = obj;
    return {
        list: [],
        pageIndex: 0,
        totalPages: 0,
        total: 0,
        pageSize,
    };

}


export function clearTrimObj(data) {
    for (const key in data) {
        const keys = Object.keys(data[key]);
        if (keys.length > 0) {
            if (Array.isArray(data[key])) {
                for (const [index, ele] of data[key].entries()) {
                    if (typeof ele === 'object') {
                        clearTrimObj(ele);
                    } else {
                        data[key][index] = ele.trim();
                    }
                }
            } else {
                clearTrimObj(data[key]);
            }

        } else {
            data[key] = data[key].trim();
        }
    }
    return data;
}


/**
 * 获得按钮切换状态
 *
 * @param {string} action 按钮类型
 * @param {string} status 按钮状态
 * @returns Object
 */
export function getButtonStatus(action, status) {
    let enabledObj = {};
    switch (status) {
        case 'view':
            enabledObj = {
                add: false,
                edit: false,
                del: false,
                down: false,
                import: false,
                export: false,
                save: true,
                cancel: true
            }

            return enabledObj[action];
        case 'new':
            enabledObj = {
                add: false,
                edit: true,
                del: true,
                down: true,
                import: true,
                export: true,
                save: false,
                cancel: false
            }
            return enabledObj[action];
        case 'edit':
            enabledObj = {
                add: true,
                edit: true,
                del: true,
                down: true,
                import: true,
                export: true,
                save: false,
                cancel: false
            }
            return enabledObj[action];
        default:
            break;
    }
}


/**
 * 过滤脏数据按照|分割的字段
 *
 * @param {object} data
 * @returns
 */
export function filterDataParam(data) {
    let keys = Object.keys(data);
    let values = Object.values(data);
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('|') > -1) {
            let _key = keys[i].split('|')[0];//字段
            let _index = keys[i].split('|')[1];//当前对象索引
            let _value = values[i];//值
            if (typeof arr[_index] != 'object') {
                arr[_index] = {};
            }
            arr[_index][_key] = _value;
        }
    }
    return arr;
}

/**
 * 删除指定的key数据
 * @param {array} keyData - 选择的数组对象包含key
 * @param {array} res - 系统默认的list数据
 * @returns {array} - 处理后的数组对象数据，用于表数据
 */
export function delArrayByKey(keyData, res) {
    for (let keyItem of keyData) {
        for (let [index, ele] of res.entries()) {
            if (keyItem.key === ele.key) {
                res.splice(index, 1);
                break
            }
        }
    }
    return res;
}
