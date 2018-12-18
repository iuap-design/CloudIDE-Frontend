import env from '../env';
import * as common from './common';
// import request from 'request'
import { genFetchOptions, toJSON, catchException } from 'yxyweb/common/helpers/util'

const doFetch = function (url) {
  const options = genFetchOptions('get');
  return fetch(url, options)
    .then(toJSON, catchException)
    .then(json => {
      return {
        code: 200,
        data: json
      }
    })
}

export default function (router) {
  router.get('/geocoder', async function (ctx) {
    const { req, res, path } = ctx
    let address = ctx.request.query.address;
    let url = 'http://restapi.amap.com/v3/geocode/geo?key=ede8f8d4850bea0a28322f5537730107&s=rsv3&address=' + encodeURIComponent(address);
    // url += '?billno='+ctx.params.billno+'&groupcode='+ctx.params.groupcode+'&tplid='+ctx.params.tplid+'&token='+ctx.request.query.token;
    //console.log('url', url);
    // ctx.body = await req.pipe(request(url))

    ctx.body = await doFetch(url);


    // let titleData = await common.doFetch(url);
    // debugger
    // ctx.body = titleData;
    //console.log("titledata", titleData);
  })
  router.get('/geoaddress', async function (ctx) {
    const { req, res, path } = ctx
    let location = ctx.request.query.location;
    let url = 'http://restapi.amap.com/v3/geocode/regeo?key=ede8f8d4850bea0a28322f5537730107&s=rsv3&location=' + encodeURIComponent(location);
    // url += '?billno='+ctx.params.billno+'&groupcode='+ctx.params.groupcode+'&tplid='+ctx.params.tplid+'&token='+ctx.request.query.token;
    //console.log('url', url);
    // ctx.body = await req.pipe(request(url))

    ctx.body = await doFetch(url);


    // let titleData = await common.doFetch(url);
    // debugger
    // ctx.body = titleData;
    //console.log("titledata", titleData);
  })
  router.get('/uniform/getWeather', async function (ctx) {
    //http://api.map.baidu.com/telematics/v3/weather?location=北京市&output=json&ak=Xc0b88CMj1YgLa1rTLvLungBPKmIaoMo
    const serviceUrl = 'http://api.map.baidu.com/telematics/v3/weather' + ctx.req.url.substr(19);
    ctx.body = await doFetch(serviceUrl);
  });
  router.get('/uniform/getMap', async function (ctx) {

    console.log(" ctx.req.url =" + ctx.req.url);
    let str = ctx.req.url;
    str = str.substr(str.indexOf("subUrl=") + 7);
    let serviceUrl = 'http://yxy-lsy.oss-cn-beijing.aliyuncs.com/echartmap/json/' + str;
    console.log("  serviceUrl = " + serviceUrl);

    ctx.body = await doFetch(serviceUrl);
  });


  router.get('/uniform/getLocalCity', async function (ctx) {
    // const serviceUrl = 'http://api.map.baidu.com/location/ip?output=json&ak=Da2GUB3raZGa2XnLnmYT1KUwvaT9FYPw&coor=bd09ll';
    const serviceUrl = 'http://api.map.baidu.com/location/ip' + ctx.req.url.substr(21);
    ctx.body = await doFetch(serviceUrl);
  });

  router.get('/uniform/getLogistics', async function (ctx) {
    const serviceUrl = 'http://express.yonyouup.com/api/trace' + ctx.req.url.substr(21);

    ctx.body = await doFetch(serviceUrl);
  });
}
