/**
 * Created with JetBrains WebStorm.
 * User: chengjq1
 * Date: 13-5-1
 * Time: 上午10:35
 * To change this template use File | Settings | File Templates.
 */

var http=require('http')
    ,path=require('path')
    ,fs=require('fs')
    ,route=require('./routes/route.js');


var session=new (require('./session'))();

http.createServer(function(request,response){
    route(request,response,session);
//    var lookup=decodeURI(request.url)=='/'?'index.html':decodeURI(request.url);
//    console.log(lookup);
////    var lookup=decodeURI(request.url) || 'index.html'
//      var f='content/'+lookup;
//    fs.exists(f,function(exists){
//        if(exists){
//            fs.readFile(f,function(err,data){
//                if(err){
//                    response.writeHead(500);
//                    response.end('Server error');
//                    return;
//                }
//                var headers={'Content-type':mimeTypes[path.extname(f)]};
//                response.writeHead(200,headers);
//                response.end(data);
//
//            });
//
//            return;
//        }
//        response.writeHead(404);
//        response.end();
//        console.log(exists?lookup+' is there':lookup+" doesn't exist");
//    })

}).listen(3000);

