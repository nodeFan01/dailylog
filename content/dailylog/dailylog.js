
var orgs=[];
var users=[];
var types=[];
var logs=[];
var uID;
var editedLogIndex;
var log_div= $("logs");
var span_desc_width;
var showFilterBar=false;


function getUId(){
    var cookies=document.cookie.split("=");
    var index=cookies.indexOf("raw2_uid");
    if(index!==-1){return cookies[index+1];}
}
function loadPage(){
    uID=getUId();
    var today=formatDateTime(null,"yyyy/mm/dd");
    serializeQuery([
        {q:{m:"dailylog",a:"get",i:"basicItems",v:"orgs"},dataAcceptor:"orgs"}
,{q:{m:"dailylog",a:"get",i:"basicItems",v:"users"},dataAcceptor:"users"}
        ,{q:{m:"dailylog",a:"get",i:"basicItems",v:"types"},dataAcceptor:"types"}
        ,{q:{m:"dailylog",a:"get",i:"logs",v:{u:uID}},dataAcceptor:"logs"}
//        ,{QueryId:{m:"dailylog",a:"get",i:"logs",v:"logs"},dataAcceptor:"logs"}
],initializePage);
}
function serializeQuery(querySerial,cb){
    var c=querySerial.length;
    querySerial.forEach(function(qs){

        url='/query?q='+JSON.stringify(qs.q);
        queryData(url,function(err,data){

            window[qs.dataAcceptor]=JSON.parse(data);
            c--;
            if(c<=0){
                cb();
            }
        });

    })  ;
}

function showHideFilterBar(){
    showFilterBar=!showFilterBar;
    $('filterbar').style.display=showFilterBar?'block':'none';
}

function initializePage(){
//    InitAttachmentEditor();
    var select_logtype_filter=$('select_logtype_filter');
    var select_logtype_editor=$('editorLogTypes');
    for(var i=0;i<types.length;i++){
        select_logtype_filter.options.add(new Option(types[i].name,types[i].id));
        select_logtype_editor.options.add(new Option(types[i].name,types[i].id));
    }
    var select_user=$('select_user');
    for(var i=0;i<users.length;i++){
        select_user.options.add(
            new Option(users[i].name,users[i].id)
        );

    }

    var t_text="";
    for(var i=0;i<orgs.length;i++){
        t_text+=orgs[i].name+",";
    }
//                   t_text=t_text.substr(1,t_text.length-1);
    $('filter_orgs').title=t_text;
    $('editor_orgs').title=t_text;
    $('docTitle').textContent=(formatDateTime(null,"yyyy-mm-dd")+"  "+getNameById(uID,users));
    pageResized();
    initAttachmentEditor();
}

function retrieveOrgs(_oIn){   // _o is the input string
    var _orgs=[];
    var o=_oIn.split(',');
    for(var i=0;i< o.length;i++){
        next_org:
        if(o[i]!==''){
            for(var j=0;j<orgs.length;j++){
                if(orgs[j].name==o[i]){
                   _orgs.push(orgs[j].id);
                    break next_org;
                }else{
                    if(j==orgs.length-1){
                        return null;
                    }
                }
            }
        }
    }
    return _orgs;
    }
function validateOrgInput(ev){
       var v=ev.target.value;
    if(v.length==0){
        ev.target.style.backgroundColor='#ffffff';
        return;
    }
    v= v.toUpperCase();
    ev.target.value=v;
    ev.target.style.backgroundColor=retrieveOrgs(v)==null?'#ff0000':'#ffffff';
}

function pageResized(){
    var h=document.height-90+"px";
    span_desc_width=document.width-400;

    log_div.style.height=h;
    $("log_list").style.height=h;
    $("filterbar").style.width=document.width-210+"px";
    redrawLogs();
    }
function redrawLogs(){

        function displayLog(i){
            var log=logs[i];
            var s='<li>';
            if(log.u==uID && (log.dt.indexOf(formatDateTime(null,"yyyy-mm-dd"))!==-1)){
                s+='<button onclick="editLog('+i+')">E</button>';
                s+='<button onclick="deleteLog('+i+')">X</button>';
            } else{
                s+='<button disabled>E</button>';
                s+='<button disabled>X</button>';
            }

            s+="<span class='span_datetime'>"+ log.dt+"</span>";
            s+="<span class='span_orgs'>"+getOrgDesc(log.orgs)+"</span>";
            s+="<span class='span_user'>"+log.un+"</span>";
            s+="<span class='span_type'>"+getNameById(log.t,types)+"</span>";
            s+="<span class='span_desc'>"+regulateDesc(log.dsc)+"</span>";
            if(log.a){
                for(var j=0;j<log.a.length;j++){
                    s+="<a href='dailylog_att"+ log.a[j].id+"'><img src='"+ log.a[j].iP+"' title='file:"+ log.a[j].fn+"/"+ log.a[j].desc+"'></a>"; ;
                }
            }

            s+="</li>";
            return s;
        }

    function addSpaces(c){
        var s="";
        for(var i=0;i<c;i++){s+='&nbsp';}
        return s;
    }
    function regulateDesc(desc){
        if(!desc){return("N/A");}
        var descLength=span_desc_width/8;
        if(desc.length<descLength){
            return desc+addSpaces(descLength-desc.length+1);
        }
        return(desc.substr(0,descLength)+"...");
    }



    var s="<ul id='log_list'>";
    for(var i=0;i<logs.length;i++){
    s+=displayLog(i);
    }





s+="</ul>";
log_div.innerHTML=s;


}

function getOrgDesc(_orgs){
    if(_orgs && _orgs.length>0){
        var s="";
        for(var i=0;i<_orgs.length;i++){
            s+=getNameById(_orgs[i],orgs)+",";
        }
        return s;
    }
    return "N/A";
}
function getNameById(id,json_array){
    for(var j=0;j<json_array.length;j++){
        if(id==json_array[j].id){
            return json_array[j].name;
        }
    }
    return "N/A";
}

function newLog(){
    var _dt=formatDateTime(null,"yyyy-mm-dd hh:mm:ss");
    var url='/query?q='+JSON.stringify({m:"dailylog",a:"get",i:"newlog",v:{u:uID,dt:_dt,t:1001}});
    queryData(url,function(error,data){
         if(data){
             logs.push({
                 id:JSON.parse(data).id
                 ,un:getNameById(uID,users)
                 ,dt:_dt
                 ,t:999
             })  ;
             redrawLogs();
             editLog(logs.length-1);
         }
    })  ;
}

function editLog(i){
    editedLogIndex=i;
    var div_editor=$('div_editor');
    $('cover').style.display='block';
    $('editor_orgs').value=getOrgDesc(logs[i].orgs);
    $('editorDesc').value=logs[i].dsc;
    $('editorLogTypes').selectedIndex=function(index){
        for(var j=0;j<types.length;j++){
            if(types[j].id==logs[index].t)
            {return j;}
        }
    }(i);
    $('editorTitle').textContent=logs[i].dt+":"+logs[i].un;
    cover.style.display='block';
    div_editor.style.display='block';
 }



function editorOK(){
   var log=logs[editedLogIndex];
    var _o=retrieveOrgs($('editor_orgs').value);
    var editorLogTypes=$('editorLogTypes');

    var _v={
        id:log.id
        ,t:editorLogTypes.options[editorLogTypes.selectedIndex].value
        ,dsc:$('editorDesc').value
    };
    _v.o=[];for(var i=0;i<_o.length;i++){_v.o.push(_o[i]);}
    var url='/query?q='+JSON.stringify({m:"dailylog",a:"post",i:"updatedailylog",v:_v});
    queryData(url,function(err,data){
        if(data){

                logs[editedLogIndex].t=_v.t;
                logs[editedLogIndex].orgs=[];for(var i=0;i<_v.o.length;i++){logs[editedLogIndex].orgs.push(_v.o[i]);}
                logs[editedLogIndex].dsc=_v.dsc;

            redrawLogs();
            $('div_editor').style.display='none';
            $('cover').style.display='none';
        }

    })  ;

}

function queryLogs(){
//    this.fromDate;
//    this.toDate;
//    this.orgs=[];
//    this.logType;
//    this.user;
//    this.setFilter=function(id,value){
//        this.id=value;
//    }
    var v={};
    if(!filter.fromDate){filter.fromDate=new Date();}
    if(!filter.toDate){filter.toDate=new Date();}
    if(filter.fromDate>filter.toDate){filter.fromDate=filter.toDate;}
    v.d1=formatDateTime(filter.fromDate,"yyyy-mm-dd");
    v.d2=formatDateTime(filter.toDate,"yyyy-mm-dd");
    v.u=filter.user;
    v.t=filter.logType;
    if(filter.orgs.length>0){
        v.o=[];
        for(var i=0;i<filter.orgs.length;i++){v.o.push(filter.orgs[i]);}
    }

    var url={m:"dailylog",a:"get",i:"logs","v":v};
    queryData(url,redrawLogs);
}






