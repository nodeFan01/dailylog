function $(id){return ((typeof(id)=="string")?document.getElementById(id):id);}

function queryData(url,cb){
    var req=new XMLHttpRequest();
    req.onreadystatechange=function(){
        if(req.readyState==4 && req.status==200){
            console.log(req.responseText);
            return cb(null,req.responseText);
        }
    }
    try{
        req.open("get",url,true);
        req.send(null);
    }
    catch(exception){
        return;
    }
}

