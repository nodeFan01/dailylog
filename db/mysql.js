var mysqlSettings=require('../configure').mysqlSettings;
var mysql=require('mysql').createPool(mysqlSettings);
module.exports=function(cb){
    mysql.getConnection(function(err,connection){
         cb(err,connection);
    })  ;
};

//module.exports=mysql.createConnection(mysqlSettings);//.createConnection(mysqlSettings);
