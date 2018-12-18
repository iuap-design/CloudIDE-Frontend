import request from "utils/request";

//定义接口地址
const URL = {
    "GET_DATA":  `${GROBAL_HTTP_CTX}/hello_world/list`
    
}

export const getData = (params) => {

    return request(URL.GET_DATA, {
        method: "get",
        param: params
    });
}
