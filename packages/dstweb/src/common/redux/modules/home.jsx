
import Immutable from 'immutable';
import moment from 'moment';
import { genAction, proxy } from 'yxyweb/common/helpers/util';

const $$initialState = Immutable.fromJS({
  layOut: null,
  kanbans: [],
  showShops: [],//saleTrend 图表门店
  // shops: ['三里屯店', '西单店', '中关村店'], //saleTrend 表头门店 trend_showData的name的集合
  trend_showData: [{ name: '三里屯店', data: [120, 132, 101, 134, 890, 230, 210, 100, 800] }, { name: '西单店', data: [220, 182, 191, 234, 290, 330, 310, 102, 109] }, { name: '中关村店', data: [320, 332, 301, 334, 390, 330, 320, 201, 100] }],
  trend_serviceData: [{ name: '三里屯店', data: [120, 132, 101, 134, 890, 230, 210, 100, 800] }, { name: '西单店', data: [220, 182, 191, 234, 290, 330, 310, 102, 109] }, { name: '中关村店', data: [320, 332, 301, 334, 390, 330, 320, 201, 100] }],
});
export default (state = $$initialState, action) => {
  switch (action.type) {
    case 'PLATFORM_UI_HOME_GET_LAYOUT':
      return state.merge({ layOut: action.payload });
    case 'PLATFORM_UI_HOME_GET_KANBAN':
      return state.merge({ kanbans: action.payload });
    case 'PLATFORM_UI_HOME_SET_OPTIONS':
      return state.merge(action.payload);
    case 'PLATFORM_UI_HOME_SALE_TREND_CHANGE_SHOP_DATA':
      return state.merge({ trend_showData: action.payload });
    default:
      return state;
  }
}

const setLayOutJson = (data, json, showStore) => {
  let layOutJson = data.row[0].col[0].row;
  let layOut = null;
  try {
    const components = {};
    json.forEach(role => {
      const roleLayout = JSON.parse(role);
      roleLayout.forEach(item => {
        if (!item.visible) return;
        if (!showStore && item.title === '门店销售趋势') return;
        components[item.title] = item;
      });
    });
    layOut = [];
    for (var attr in components)
      layOut.push(components[attr]);
  } catch (e) {
    console.error('门户组件布局' + json + '有错误：' + e.message);
  }
  if (layOut) {
    layOut.forEach(function (element) {
      let titleName;
      switch (element.title) {
        case '营业概览':
          titleName = 'TaskList'
          break;
        case '销售排行':
          titleName = 'SaleRank'
          break;
        case '门店销售趋势':
          titleName = 'SaleTrend'
          break;
      }
      layOutJson.push({ "col": [{ "span": 12, "cControlType": titleName, "title": element.title }] });
    }, this)
    return data;
  } else {
    return ''
  }
}

export function clearLayOut() {
  return genAction('PLATFORM_UI_HOME_GET_LAYOUT', null);
}

export function getLayOut(data) {
  return async function (dispatch, getState) {
    const { showStore } = getState().user.toJS();
    const row = showStore ? [{
      "col": [{
        "span": 12, "cControlType": "MyToDo"
      }]
    }] : [];
    const layoutJson = {
      "row": [{
        "col": [{
          "span": 8, "row": row
        }, {
          "span": 4, "row": [{
            "col": [{
              "span": 12, "cControlType": "CommonFunctions", "title": '常用功能'
            }]
          }, {
            "col": [{
              "span": 12, "cControlType": "Card1", "title": '通知公告', "type": 'knowledge'
            }]
          }]
        }]
      }]
    };
    let desktops = [];
    const config = {
      url: 'layout/getLayoutByUserId.do',
      method: 'GET',
    };
    const json = await proxy(config);
    if (json.code !== 200) {
      cb.utils.alert(json.message, 'error');
    } else {
      const { layouts, kanbans } = json.data;
      setLayOutJson(layoutJson, layouts, showStore);
      if (kanbans && kanbans.length)
        desktops = kanbans.filter(item => {
          return item.type === 2;
        });
    }
    dispatch(genAction('PLATFORM_UI_HOME_GET_LAYOUT', layoutJson));
    dispatch(genAction('PLATFORM_UI_HOME_GET_KANBAN', desktops));
    dispatch(getMyToDo());
  }
}

export const getMyToDo = function () {
  return async function (dispatch, getState) {
    const { showStore, storeId } = getState().user.toJS();
    if (!showStore) return;
    const data = {
      preSell: {
        caption: '预订待发', icon: 'yudingdaifa1', menuCode: 'RM0102', condition: {
          isExtend: true,
          simpleVOs: [
            { field: 'store', op: 'eq', value1: storeId },
            { field: 'iPresellState', op: 'eq', value1: 1 },
            { field: 'iDeliveryState', op: 'eq', value1: 0 },
            { field: 'dPlanShipmentDate', op: 'lt', value1: moment().add(cb.rest.AppContext.option.ordershipdate, 'days').format('YYYY-MM-DD HH:mm:ss') }
          ],
          commonVOs: [
            { itemName: 'iPresellState', value1: 1 },
            { itemName: 'iDeliveryState', value1: 0 }
          ]
        }
      },
      transferApply: {
        caption: '调拨待出', icon: 'tiaobodaichu', menuCode: 'YH03', condition: {
          isExtend: true,
          simpleVOs: [
            { field: 'outstore', op: 'eq', value1: storeId },
            { field: 'status', op: 'eq', value1: 1 }
          ],
          commonVOs: [
            { itemName: 'status', value1: ['1'] }
          ]
        }
      },
      returnApply: {
        caption: '退货待出', icon: 'tuihuodaichu', menuCode: 'YH02', condition: {
          isExtend: true,
          simpleVOs: [
            // { field: 'store', op: 'eq', value1: storeId },
            { field: 'bizstatus', op: 'eq', value1: 2 }
          ],
          commonVOs: [
            { itemName: 'bizstatus', value1: ['2'] }
          ]
        }
      },
      demandApply: {
        caption: '要货待提交', icon: 'yaohuodaiqueren1', menuCode: 'YH04', condition: {
          isExtend: true,
          simpleVOs: [
            // { field: 'store', op: 'eq', value1: storeId },
            { field: 'bizstatus', op: 'eq', value1: 0 }
          ],
          commonVOs: [
            { itemName: 'bizstatus', value1: ['0'] }
          ]
        }
      },
      storeNotice: {
        caption: '待入库', icon: 'dairuku2', menuCode: 'YH01', condition: {
          isExtend: true,
          simpleVOs: [
            { field: 'bizstatus', op: 'eq', value1: 0 }
          ],
          commonVOs: [
            { itemName: 'bizstatus', value1: ['0'] }
          ]
        }
      }
    };
    let config = {
      url: 'bill/portal/getBillNum',
      method: 'GET'
    };
    let json = await proxy(config);
    if (json.code !== 200) {
      cb.utils.alert(json.message, 'error');
      return;
    }
    const billNumObj = json.data;
    config = {
      url: 'billTemplateSet/getCurrentStoreWarehouse',
      method: 'GET',
      params: { storeId: storeId }
    };
    json = await proxy(config);
    if (json.code === 200) {
      const { otherWarehouse } = json.data;
      const warehouses = otherWarehouse;
      const value1 = [];
      warehouses && warehouses.forEach(item => {
        value1.push(item.warehouse);
      });
      data.returnApply.condition.simpleVOs.push({ field: 'outwarehouse', op: 'in', value1 });
      data.demandApply.condition.simpleVOs.push({ field: 'demandWarehouse', op: 'in', value1 });
      data.storeNotice.condition.simpleVOs.push({ field: 'inWarehouse', op: 'in', value1 });
    }
    const todoList = [];
    try {
      for (var attr in data)
        todoList.push(Object.assign({ count: billNumObj[attr] || 0 }, data[attr]));
    } catch (e) {

    }
    dispatch(setOptions({ todoList }));
  }
}

export function setOptions(data) {
  return function (dispatch) {
    dispatch(genAction('PLATFORM_UI_HOME_SET_OPTIONS', data));
  }
}

export function saleTrendChangeShop(shop) {
  return function (dispatch, getState) {
    let data = getState().home.toJS().trend_serviceData;
    let changeShopData = [];
    shop.forEach(element => {
      data.forEach(item => {
        if (element == item.name) {
          changeShopData.push(item)
        }
      })
    })
    dispatch(genAction('PLATFORM_UI_HOME_SALE_TREND_CHANGE_SHOP_DATA', changeShopData));
  }
}

// 经营概览
export function getTaskListData(options) {
  return async function (dispatch, getState) {
    // new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15).format('yyyy-MM-dd');
    let now = new Date()
    let beginDate = options.beginDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).format('yyyy-MM-dd');
    let endDate = options.endDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).format('yyyy-MM-dd');
    let compareBeginDate = options.compareBeginDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).format('yyyy-MM-dd');
    let compareEndDate = options.compareEndDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).format('yyyy-MM-dd');
    let { orgId, storeId, showStore } = getState().user.toJS();
    let store_id = showStore === false ? '全部' : (options.store_id || storeId || '全部');
    let config = {
      url: "/report/getSaleAnalysisQueryData",
      // url: "/report/getSaleRankingQueryData",
      method: "POST",
      params: {
        storeId: store_id,
        beginDate,
        endDate,
        compareBeginDate,
        compareEndDate
      }
    }
    let json = await proxy(config);
    if (json.code === 200) {
      let sourceData = json.data;
      dispatch(genAction('PLATFORM_UI_HOME_SET_OPTIONS', { taskListData: sourceData }))
    } else {
      cb.utils.alert(json.message, 'error')
      return
    }
  }
}

// 销售排行
export function getSaleRankData(options) {
  return async function (dispatch, getState) {
    let now = new Date()
    let beginDate = options.beginDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).format('yyyy-MM-dd');
    let endDate = options.endDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).format('yyyy-MM-dd');
    let { orgId, storeId, showStore } = getState().user.toJS();
    let store_id = showStore === false ? '全部' : (options.store_id || storeId || '全部');
    let config = {
      url: "/report/getSaleRankingQueryData",
      method: "POST",
      params: {
        storeId: store_id,
        beginDate,
        endDate
      }
    }
    let json = await proxy(config);
    if (json.code === 200) {
      dispatch(genAction('PLATFORM_UI_HOME_SET_OPTIONS', { saleRankData: json.data }))
    } else {
      cb.utils.alert(json.message, 'error')
      return
    }
  }
}

// 销售趋势
export function getSaleTrendData(options) {
  return async function (dispatch, getState) {
    let now = new Date()
    let beginDate = options.beginDate || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).format('yyyy-MM-dd');
    let endDate = options.endDate || now.format('yyyy-MM-dd');
    let { orgId, storeId, showStore } = getState().user.toJS();
    let store_id = showStore === false ? ['全部'] : (options.store_id || (storeId ? [storeId] : ['全部']));
    let config = {
      url: "/report/getSaleTrendAnalysisQueryData",
      method: "POST",
      params: {
        storeId: store_id,
        beginDate,
        endDate
      }
    }
    let json = await proxy(config);
    if (json.code === 200) {
      dispatch(genAction('PLATFORM_UI_HOME_SET_OPTIONS', { saleTrendData: json.data.storeBizObjects }))
    } else {
      cb.utils.alert(json.message, 'error')
      return
    }
  }
}
