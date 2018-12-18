var fs = require('fs');
var path = require('path');
var request = require('request')
import env from '../env'

export default function (router) {
  router.get('/basictest', function (ctx) {
    ctx.render({
      title: '富文本编辑器'
    });
  });

  router.all('/ueditor/ue', async function (ctx) {
    const { req } = ctx;
    const actionType = ctx.request.query.action;
    if (actionType === 'uploadimage' || actionType === 'uploadfile' || actionType === 'uploadvideo') {
      ctx.body = await newUpload(ctx);
      return
    } else if (actionType === 'listimage') {
      var static_url = path.join(process.cwd(), 'public');
      var dir_url = '/images/ueditor/';
      ctx.body = await batch(ctx, static_url, dir_url);
    } else {
      ctx.redirect('/ueditor/nodejs/config.json');
    }
  });
}
const newUpload = function (ctx) {
  return new Promise(function (resolve, reject) {
    const serviceUrl = env.HTTP_USER_UPLOAD + '?token=' + ctx.token;
    const { req } = ctx;
    req.pipe(request(serviceUrl, function (err, response, body) {
      const json = JSON.parse(body);
      if (!err) {
        resolve({ url: json.data, 'state': 'SUCCESS' });
      } else {
        reject(err);
      }
    }))
  });
};

const batch = function (ctx, static_url, dir_url) {
  return new Promise(function (resolve, reject) {
    var str = '';
    var i = 0;
    var list = [];
    fs.readdir(static_url + dir_url, function (err, files) {
      if (err) throw err;

      var total = files.length;
      files.forEach(function (file) {

        var filetype = 'jpg,png,gif,ico,bmp';
        var tmplist = file.split('.');
        var _filetype = tmplist[tmplist.length - 1];
        if (filetype.indexOf(_filetype.toLowerCase()) >= 0) {
          var temp = {};
          if (list_dir === '/') {
            temp.url = list_dir + file;
          } else {
            temp.url = list_dir + "/" + file;
          }
          list[i] = (temp);
        } else { }
        i++;
        // send file name string when all files was processed
        if (i === total) {
          resolve({
            "state": "SUCCESS",
            "list": list,
            "start": 1,
            "total": total
          });
        }
      });
    });
  });
}
