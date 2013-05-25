function formatDateTime(d,return_type){
  var d_temp;
  if(d==null){d_temp=new Date();}
//  if(typeof d == 'object'){
//    d_temp=d;
//  } else{
//    d_temp=new Date(d);
//  }
  function num(n){
    return n>=10?n:'0'+n;
  }
  switch(return_type){
    case 'date_object':
      return d_temp;
      break;
      case 'yyyy/m/d':
          return d_temp.getFullYear()+"/"+(d_temp.getMonth()+1).toString()+"/"+ d_temp.getDate();
          break;
    case 'yyyy/mm/dd':
      return d_temp.getFullYear()+"/"+num(d_temp.getMonth()+1)+"/"+ num(d_temp.getDate());
      break;
      case 'yyyy-mm-dd':
          return d_temp.getFullYear()+"-"+num(d_temp.getMonth()+1)+"-"+ num(d_temp.getDate());
          break;
    case 'hh:mm:ss':
      return num(d_temp.getHours())+":"+ num(d_temp.getMinutes())+":"+ num(d_temp.getSeconds());
      break;
    case 'yyyy/mm/dd hh:mm:ss':
        return(d_temp.getFullYear()+"/"+ num(d_temp.getMonth()+1)+"/"+ num(d_temp.getDate())+" "+num(d_temp.getHours())+":"+ num(d_temp.getMinutes())+":"+ num(d_temp.getSeconds()) );

      break;
    case "weekday":
      return(WeekDay(d_temp.getUTCDay()));
      break;
      case "yyyy-mm-dd hh:mm:ss":
          return(d_temp.getFullYear()+"-"+ num(d_temp.getMonth()+1)+"-"+ num(d_temp.getDate())+" "+num(d_temp.getHours())+":"+ num(d_temp.getMinutes())+":"+ num(d_temp.getSeconds()) );
//          return(d_temp.getFullYear()+"-"+ (d_temp.getMonth()+1).toString()+"-"+ d_temp.getDate()+
//              " "+num(d_temp.getHours())+":"+ num(d_temp.getMinutes())+":"+ num(d_temp.getSeconds()));
          break;
  }
}

function WeekDay(i){
  var d=['周日','周一','周二','周三','周四','周五','周六'];
  return(d[i]);

}


