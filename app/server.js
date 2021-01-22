var http = require('http');
var url =require('url');  //url和http都是node.js模块


function GetUrlParam(url) {
  var arrObj = url.split("?");
  const query = {};
  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;
    for (var i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");
      if (arr != null && arr[0]) {
        const key = arr[0];
        query[key] = arr[1];
      }
    }
  }
  return query;
}
// 路由文件
function router(handle,pathname, request,response) {
  if (typeof handle[pathname] ==='function') {
    return handle[pathname](request,response);
  }else{
    console.log('no request'+pathname);
    return 'NOT found';
  }
}

function start(handle, port = 8000) {
  function onRequest(request,response) {
    var pathname = url.parse(request.url).pathname;
    response.writeHead(200,{'Content-Type':'text/plain'});
    request.query = GetUrlParam(request.url);
    var content = router(handle,pathname, request,response);
    response.write(JSON.stringify(content));
    response.end();
  }
  http.createServer(onRequest).listen(port);
  console.log('server running at 8000');
}

module.exports = start;