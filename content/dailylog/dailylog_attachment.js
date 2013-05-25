var droparea=$('attachment_droparea')

    ;
files=[];



function initAttachmentEditor(){
   droparea.addEventListener('drop',function(e){
       e.stopPropagation();
       e.preventDefault();
       var _files = e.dataTransfer.files;
        files=[];
       for(var i=0;i<_files.length;i++){
           files.push({
               objfile:_files[i]
               ,status:"processing"   //uploaded
               ,percentage:0
//               ,href:""
//               ,src:""
           });
       }

       redrawFiles();
       uploadFile();
   })  ;
    droparea.addEventListener('dragover',function(e){
        e.stopPropagation();
        e.preventDefault();
    })  ;
    droparea.addEventListener('dragleave',function(e){
        e.stopPropagation();
        e.preventDefault();
    })  ;
}

function deleteAttachment(i){
    queryData();
}



function progressFunction(evt) {

    var progressBar = $("progressBar");

    var percentageDiv = $("percentage");

    if (evt.lengthComputable) {

        progressBar.max = evt.total;

        progressBar.value = evt.loaded;

        percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + "%";

    }

}

function UpladFile() {

    var fileObj = document.getElementById("file").files[0]; // js 获取文件对象

    var FileController = "/upload";                    // 接收上传文件的后台地址



    // FormData 对象

    var form = new FormData();

    form.append("author", "hooyes");                        // 可以增加表单数据

    form.append("file", fileObj);                           // 文件对象



    // XMLHttpRequest 对象

    var xhr = new XMLHttpRequest();

    xhr.open("post", FileController, true);

    xhr.onload = function () {

        // alert("上传完成!");

    };

    xhr.upload.addEventListener("progress", progressFunction, false);

    xhr.send(form);

}

function redrawFiles(f_id){
    if(f_id>=0){
        var fdiv=$('fdiv'+f_id);
        var f=files[f_id];
        if(files[f_id].status=='processing'){
            $('fdiv'+f_id).innerHTML= f.percentage+'%<progress value="'+ f.percentage+'" max="100" ></progress>'+ f.objfile.name;
        }  else{
            $('fdiv'+f_id).innerHTML=
                '<a href="file-dailylog-'+files[f_id].id + '">'
                    +'<img src="'+ files[f_id].imgPath+'">'+files[f_id].filename
                    +'</a>'
                    +'<button onclick="deleteFile('+files[f_id].id+')">X</button> ';
        }
    } else{
        //new
        var s='';
        for(var i= 0;i<files.length;i++){
            s+='<div id="fdiv'+i+'"></div>';
        }
       droparea.innerHTML=s;
        for(var i=0;i<files.length;i++){redrawFiles(i);}
    }

}

function uploadFile(){
    files.forEach(function(f,index){
        var form = new FormData();
        form.append("mId","dailylog");
        form.append("rId",logs[editedLogIndex].id);
        form.append("filename", f.objfile.name);
        form.append("file", f.objfile);                           // 文件对象
        var xhr = new XMLHttpRequest();

        xhr.open("post", "/upload", true);

        xhr.onload = function () {
            var fileInfo=JSON.parse(xhr.responseText);
           // id:rows.insertRow,filename: v.fname, img: v.mimePath
            f.filename=fileInfo.filename;
            f.imagePath=fileInfo.mimePath;
            f.id=fileInfo.id;
            f.status="loaded";
            redrawFiles(index);
        };

        xhr.upload.addEventListener("progress",function(evt){
            if (evt.lengthComputable) {
                f.percentage=Math.round(evt.loaded/evt.total*100);
                redrawFiles(index);
            }

        }, false);

        xhr.send(form);

    })  ;
}
