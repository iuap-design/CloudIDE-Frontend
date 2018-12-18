import {actions} from "mirrorx";
// 引入services，如不需要接口请求可不写
import * as api from "./service";

import { processData } from 'utils';

export default {
    // 确定 Store 中的数据模型作用域
    name: "helloworld",
    // 设置当前 Model 所需的初始化 state
    initialState: {
        helloMsg:'',
    },
    reducers: {
        /**
         * 纯函数，相当于 Redux 中的 Reducer，只负责对数据的更新。
         * @param {*} state
         * @param {*} data
         */
        updateState(state, data) { //更新state
            return {
                ...state,
                ...data
            };
        }
    },
    effects: {
        /**
         * 按钮测试数据
         * @param {*} param
         * @param {*} getState
         */
        async loadData(param, getState) {
            
            let res = processData(await api.getData(param));
            console.log("res",res);
            if (res) {
                actions.helloworld.updateState({
                    helloMsg: res.content[0].name
                });
            }
        },

    }
};
