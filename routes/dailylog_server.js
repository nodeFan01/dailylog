var getMysql=require('../db/mysql');
var fs=require('fs');
var formidable=require('formidable');




function queryDailyLog(v,cb){

    /**
     * v.d1 - from date
     * v.d2 - to date
     * v.u - user_id
     * v.t - log_type
     * v.o - [orgs]
     * v.a - [attachments]
     */
     getMysql(function(e,mysql){
          if(mysql){
              var sql_string='SELECT d.id,d.user_id as u,u.name AS un,d.log_type AS t,DATE_FORMAT(d.date_time,"%Y-%m-%d %H:%i:%s") AS dt,d.description AS dsc FROM dailylog d JOIN users u ON u.id=d.user_id WHERE';
              var conditionInitialized=false;
              if(v.d1 && v.d2){
                  sql_string+="d.date_time BETWEEN '"+ v.d1+"' AND '"+ v.d2+"'";
                  conditionInitialized=true;
              }
              if(v.u){
                  if(conditionInitialized){
                      sql_string+=" AND d.user_id="+ v.u;
                  }else{
                      sql_string+=" d.user_id="+ v.u;
                      conditionInitialized=true;
                  }
              }
              if(v.t){
                  if(conditionInitialized){
                      sql_string+=" AND d.log_type="+ v.t;
                  }else{
                      sql_string+=" d.log_type="+ v.t;
                      conditionInitialized=true;
                  }
              }

              if(v.o){
                  if(conditionInitialized){
                      sql_string+=" AND d.id IN(SELECT dailylog_id FROM dailylog_org WHERE org_id IN("+ v.o.join(",")+")";
                  }else{
                      sql_string+=" d.id IN(SELECT dailylog_id FROM dailylog_org WHERE org_id IN("+ v.o.join(",")+")";

                  }
              }
              sql_string+=" ORDER BY date_time DESC "
              mysql.query(sql_string,function(error, results, fields)
                  {


                      if(results.length==0){mysql.end();cb(null,[]);return;}
                      var c=results.length;
                      results.forEach(function(rlt,index){

//                serializeQuery([
//                    {sql:"SELECT a.id,a.dailylog_id AS dId,a.file_name as fn,a.description AS desc,at.path AS iP FROM dailylog_attachments a JOIN dailylog_attachment_types at ON a.attachment_type=at.id WHERE a.id="+rlt.id,target:rlt.a}
//                ,{sql:"SELECT org_id FROM dailylog_org WHERE dailylog_id="+rlt.id,target:rlt.orgs}]
//                    ,c);
//                if(c[0]<=0){cb(null,results);}

//
                          mysql.query("SELECT a.id,a.dailylog_id AS dId,a.file_name as fn,a.description AS desc,at.path AS iP FROM dailylog_attachments a JOIN dailylog_attachment_types at ON a.attachment_type=at.id WHERE a.id="+rlt.id,function(err,rlts,fields){
//                    if(err){cb(null,results);return;}

                              if(rlts){
                                  results[index].a=[];
                                  for(var j=0;j<rlts.length;j++){ results[index].a.push(rlts[i]);}
                              }
                              mysql.query("SELECT org_id FROM dailylog_org WHERE dailylog_id="+rlt.id,function(err2,rlts2,fields2){
                                  mysql.end();
                                  if(rlts2){
                                      results[index].orgs=[];
                                      for(var j=0;j<rlts2.length;j++){ results[index].orgs.push(rlts2[j].org_id);}
                                  }
                                  c--;
                                  if(c<=0){cb(null,results);}
                              });


                          })
                      });
                  }
              );


          }else{
              cb(e);
          }

     })  ;



//    console.log("sql_string:"+sql_string);

}

function serializeQuery(q,logs_count){
    var c= q.length;
    q.forEach(function(_q){
        mysql.query(_q.sql,function(err,rlts){
            mysql.end();
            if(!err){
                for(var i=0;i<rlts.length;i++){
                    _q.target.push(rlts[i]);
                }
            }
            c--;
            if(c<=0){logs_count[0]--;}
        });

    })  ;

}
function serializedQuery(mysql,sqls,cb,cb_value){
    var c=sqls.length;
    sqls.forEach(function(q){
        mysql.query(q,function(err,rlts){
            console.log(rlts);
            c--;
            if(c<=0){
                mysql.end();
                cb(null,cb_value);
            }
        }) ;
    })

}
function updateDailyLog(log,cb){
    console.log(log);
     getMysql(function(error,mysql){
          if(mysql){
              var sql=[];
              sql.push("DELETE FROM dailylog_org WHERE dailylog_id="+log.id);
              if(log.o.length>0){
                  for(var i=0;i<log.o.length;i++){
                      sql.push("INSERT INTO dailylog_org (dailylog_id,org_id) VALUES("+log.id+","+log.o[i]+")");
                                        }
              }
              sql.push("UPDATE dailylog SET log_type="+log.t+" ,description='"+log.dsc+"' WHERE id="+log.id);
              serializedQuery(mysql,sql,cb,{id:log.id});
          }
     })  ;

}

function newDailyLog(v,cb){
    getMysql(function(error,mysql){
         if(mysql){
             console.log(v);
             mysql.query("INSERT INTO dailylog(user_id,date_time,log_type) VALUES(?,?,?)",[v.u, v.dt, v.t],function(err,rows,fields){
                 mysql.end();
                 if(rows){cb(null,{id:rows.insertId});return;}
                 cb(err);
             })
         }
    })  ;

}


function deleteAttachment(){
    //delete file
    //delete database record
}
function deleteDailyLog(){

}
function getBasicItems(v,cb){
    var basicItems={
        "users":"SELECT id,name FROM users"
        ,"orgs":"SELECT id,name FROM organizations"
        ,"types":"SELECT id,name FROM dailylog_types"
    };
    var sql_string=basicItems[v];

    if(sql_string){
        getMysql(function(error,mysql){
            if(mysql){
                mysql.query(sql_string,function(error,rows,fields){
                    mysql.end();
                    cb(error,rows);
                })  ;
            }
        }) ;
    }
}
function downloadAttachment(attachment_id,res){
    getMysql(function(error,mysql){
         if(mysql){
             mysql.query("",function(error,rows){
                  if(rows){
                      require('upload_download').returnFile(rows[0].path,res);
                  }
             })  ;
         }
    })  ;

}

function uploadAttachment(v,res){
    //{dailylog_id: rId,fname:fileName, path:_dest.path,mimePath:_dest.img}
    getMysql(function(error,mysql){
        if(mysql){
            var sql_string='INSERT INTO dailylog_attachments(dailylog_id,file_name,local_path,mime_path) VALUES('
                + v.dailylog_id
                +',"' + v.fname+'"'
                +',"'+v.path+'"'
                +',"'+v.mimePath
                +'")';
            console.log(sql_string);
            mysql.query( sql_string,function(error,rows,fields){
                if(rows){
                    res.writeHead(200,{'content-type':'text/json'});
                    res.write(JSON.stringify({id:rows.insertId,filename: v.fname, img: v.mimePath}));
                    res.end('\n');
                }else{
                    res.writeHead(500,{'content-type':'text/plain'});
                    res.write('fail to save to database');
                    res.end('\n');
                }

    }) ;
}
        });
}


function cloneJSON(jsonObj){
  var buf;
  if (jsonObj instanceof Array) {
        buf = [];
        var i = jsonObj.length;
        while (i--) {
              buf[i] = clone(jsonObj[i]);
            }
        return buf;
      }else  if (jsonObj instanceof Object){
        buf = {};
        for ( var k in jsonObj) {
              buf[k] = clone(jsonObj[k]);
            }
        return buf;
      }else {
        return jsonObj;
      }
}
exports.queryDailyLog=queryDailyLog;
exports.updateDailyLog=updateDailyLog;
exports.newDailyLog=newDailyLog;
exports.deleteDailyLog=deleteDailyLog;
exports.getBasicItems=getBasicItems;
exports.uploadAttachment=uploadAttachment;
exports.downloadAttachment=downloadAttachment;
exports.deleteAttachment=deleteAttachment;