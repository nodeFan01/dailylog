
var path=require('path')
    ,fs=require('fs')
    ,querystring=require('querystring')
//    ,query=require('../db/query')
    ,url=require('url')
    ,mime=require('./mime')
    ,fileUD=require('./upload_download');
//    dailylog_server=require('dailylog_server');



var routes={
     "dailylog":{
//        "moduleID":"dailylog_server"
        "post":{
            "newLog":function(v,cb){require('./dailylog_server').newDailyLog(v,cb);}
            ,"appendAttachment":function(attachment,cb){require(this.moduleID).appendDailyLogAttachment(attachment,cb);}
            ,"updatedailylog":function(v,cb){require('./dailylog_server').updateDailyLog(v,cb);}
        }
        ,"get":{
            "basicItems":function(v,cb){require('./dailylog_server').getBasicItems(v,cb);}
            ,"logs":function(v,cb){require('./dailylog_server').queryDailyLog(v,cb);}
            ,"newlog":function(v,cb){require('./dailylog_server').newDailyLog(v,cb);}
        }

        ,"delete":{
            "log":function(){require('./dailylog_server').deleteDailyLog();}
        }


    }
};



function returnData(req,res){

    /**
     * q={m:""   --module
     * ,a:""     --action
     * ,i:""     --item
     * ,v:{}}    --value
     */

    var _url= req.url.toString();
    console.log(_url);
    if(_url.indexOf('file')!==-1){    //download file url:  file_dailylog_######
        require('upload_download').downLoadFile(_url,res);
    } else{
        var sql_json=JSON.parse(querystring.parse(url.parse(req.url).query)['q']);
        routes[sql_json.m][sql_json.a][sql_json.i](sql_json.v,function(error,data){
            if(error){
                res.writeHead(500,{'Content-type':'text/html'});
                res.end();
                return;
            }
            res.writeHead(200,{'content-type':'text/json'});
            res.write(JSON.stringify(data).replace(/\s+"/g,'"'));
            res.end('\n');

        });
    }
}




module.exports=function(req,res,session){
    switch (req.url){
        case '/upload':
            if(session.isInSession(req)){
                fileUD.upLoadFile(req,res);
            }  ;

            break;
        case '/signin':
            session.signIn(req,function(err,rlt){
                if(rlt){
                    fileUD.returnFile('content/index.html',res,{"Set-Cookie":"raw2_uid="+rlt[0].id+";maxAge=3600000","Context-Type":"text/plain"});    //

                }  else{
                    returnFile('content/signin.html',res);
                }
            });
            break;
        case '/signout':
            var _uid;
            session.signOut(req,_uid);
            fileUD.returnFile('content/signin.html',res,{'Set-Cookie':"raw2_uid="+_uid+";maxAge=0","Context-Type":"text/plain"});
            break;

        default :
            if(session.isInSession(req)){
                var lookup=decodeURI(req.url)=='/'?'index.html':decodeURI(req.url);
                if(path.extname(lookup)){
                   fileUD.returnFile('content/'+lookup,res);
                } else{
                    returnData(req,res);
                }
            } else{
               fileUD.returnFile('content/signin.html',res);
            }

            break;

    }



}   ;
