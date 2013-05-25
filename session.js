module.exports=function(){

        var getMysql=require('./db/mysql');
        var querystring=require('querystring');
        var sessions=[];
        this.isInSession=function(req){

            if(sessions.length<=0){return false;}
            var id=objectifyUpComingCookie(req).raw2_uid;

            if(sessions.indexOf(parseInt(id))==-1){return false;}
            return true;
        } ;
        this.addSession=function(id){
            if(this.isInSession(id)){return id;}
            sessions.push(id);
            return id;
        };
        this.deleteSession=function(id){
            sessions=sessions.splice(id);
        } ;
        this.signOut=function(req,uid){
            var _uid=objectifyUpComingCookie(req).raw2_uid;
            this.deleteSession(_uid);
            uid=_uid;
        };
        this.signIn=function(req,cb){
            var t=this;

            var info='';
            req
                .on('data',function(chunk){info+=chunk;})
                .on('end',function(){
                    info=querystring.parse(info);
                    getMysql(function(error,mysql){
                        if(mysql){
                            mysql.query("SELECT id,name FROM users WHERE name=? AND password=?",[info.uname,info.pwd],function(err,rows,fields){
                                mysql.end();
                                if(rows){
                                       t.addSession((rows[0].id));
                                        cb(null,rows);
                                   }else{
                                       cb(err) ;
                                   }
                            }) ;
                        }

                    })  ;

                });
        } ;

        function objectifyUpComingCookie(req){
            var _cookies = {};
            req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
                var parts = Cookie.split('=');
                _cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
            });
            return _cookies;
        }


}