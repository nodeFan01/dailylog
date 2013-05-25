/**
 * Created with JetBrains WebStorm.
 * User: chengjq1
 * Date: 13-5-1
 * Time: 上午10:35
 * To change this template use File | Settings | File Templates.
 */

var http=require('http')
    ,path=require('path')
    ,fs=require('fs');

var mimeTypes = {
    '.js' : 'text/javascript',
    '.html': 'text/html',
    '.css' : 'text/css'
};

var cache={};
function cacheAndDeliver(f,cb){

    fs.stat(f,function(err,stats){
         var lastChanged=Date.parse(stats.ctime),
             isUpdated=((cache[f]) && lastChanged>cache[f].timestamp);
        if(cache[f]&&(!isUpdated)){
            console.log('loading '+f+' from cache');
            cb(null,cache[f].content);

            return;
        }

        fs.readFile(f,function(err,data){
           if(err){cb(err,data);return;}
            cache[f]={content:data,timestamp:Date.now()};
            cb(null,data);
            return;
        });

    })  ;

 return;
}

http.createServer(function(request,response){
    var lookup=path.basename(decodeURI(request.url)) || 'index.html'
        ,f='content/'+lookup;
    fs.exists(f,function(exists){
        if(exists){
            cacheAndDeliver(f,function(err,data){
                if(err){
                    response.writeHead(500);
                    response.end('Server error');
                    return;
                }
                var headers={'Content-type':mimeTypes[path.extname(f)]};
                response.writeHead(200,headers);
                response.end(data);

                });

            return;
        }
        response.writeHead(404);
        response.end();
         console.log(exists?lookup+' is there':lookup+" doesn't exist");
    })  ;

    }).listen(3000);
