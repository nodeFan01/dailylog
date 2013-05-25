var mime=require('./mime')
    ,path=require('path')
    fs=require('fs')
    formidable=require('formidable');

function uploadFile(req,res){
    var temp_folder=require('../configure').tempFolder;
    function pathRule(_fname,_moduleId){
        var ext=path.extname(_fname);
        var d=new Date();
        var dest_folder=require('../configure')[_moduleId+"_folder"];
        var _fpath=dest_folder+'/'+ d.getFullYear()+"."+ (d.getMonth()+1).toString();
        return {img:mime[ext].imgPath,path:_fpath+"/"+_fname};
    }
    var form=new formidable.IncomingForm(),
        files=[]
        ,fields=[]
        ,pathName;

     form.uploadDir=temp_folder;
    form
        .on('field',function(field,value){
//                    console.log(field, value);
            fields.push([field, value]);
        })
        .on('file',function(field,file){
//                    console.log(field, file);
            pathName=file.path;
            files.push([field, file]);
        })
        .on('aborted',function(){
            cb(null,[]);
        })
        .on('end',function(){


            var fileInfo=function(f){
                var r={};
                f.forEach(function(i){
                    r[i[0]]=i[1];
                })  ;
                return r;
            }(fields);
            var _dest=pathRule(fileInfo.filename,fileInfo.mId);
            fs.rename(temp_folder+"/"+pathName.split("\\")[1],_dest.path,function(error){
//                if(error){res.end();}
                switch(fileInfo.mId){
                    case 'dailylog':
                        require('./dailylog_server').uploadAttachment({dailylog_id: fileInfo.rId,fname:fileInfo.filename, path:_dest.path,mimePath:_dest.img},res);                           break;
                }


            });
        });
    form.parse(req);
}
function downloadFile(url,res){
    var module_id=url.split("-")[1];
    switch(module_id){
        case "dailylog":
           require('dailylog_server').downloadAttachment(url.split("-")[2],res);
            break;

    }

}

function returnFile(f,res,header){
    fs.exists(f, function(exists) {
        if (exists) {
            var fileStream = fs.createReadStream(f);
            var headers=header?header:{'Content-type':mime[path.extname(f)].appType};
            res.writeHead(200, headers);
            fileStream.pipe(res);
            fileStream.on("end", function() {
                res.end();
            })
        }
    });
}

exports.upLoadFile=uploadFile;
exports.downLoadFile=downloadFile;
exports.returnFile=returnFile;
