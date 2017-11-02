var express = require('express');
var app = express();
var JSONStream = require('JSONStream');
var upload = require('./fileuploads');
var https = require('https');
var iconv = require("iconv-lite");
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_USER = 'mongodb://localhost:27017/userinfo';
var DB_CONN_PGK = 'mongodb://localhost:27017/pkginfo';
var fs = require('fs');
app.use(express.static('public'));

// app.get('/index.htm', function (req, res) {
//    res.sendFile( __dirname + "/" + "index.htm" );
// })

//文件上传服务
app.post('/file_upload', upload.single('voices'), function(req, res, next){
    if(req.file) {
        res.send({stat:1, msg:'文件上传成功'});
        // console.log(req.file);
        // console.log(req.body);
        var total = parseInt(req.body.total);
        var c_pkgid = parseInt(req.body.pkgid);
        // console.log(total);
        if(total == 1 && c_pkgid >= 0){
            MongoClient.connect(DB_CONN_USER, function(err, db) {
                var ucol = db.collection("users");
                var cur_pkg = -1;
                ucol.findOneAndUpdate({openid:req.body.openid}, {$set: {cur_pkg: cur_pkg}, 
                                        $inc: {completed:1, unpaid:1}}, null, function(err2, r){
                    var pcol = db.collection('pkgs');
                    pcol.findOneAndUpdate({pkgid:c_pkgid}, {$set: {pstat:2}}, null, function(err3, r2) {
                        db.close();
                    });
                });
            });
        }
    }
});

app.get('/onLogin', function(req, res) {
    // console.log(req.query.code);
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=wx644164cc8d8111da'
            + '&secret=7cdb275c55b116ace71b69af7ac6a23a&js_code='
            + req.query.code + '&grant_type=authorization_code';
    https.get(url, function (ress) {
        var datas = [];
        var size = 0;
        ress.on('data', function (data) {
            datas.push(data);
            size += data.length;
        })
        ress.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var retv = JSON.parse(iconv.decode(buff, "utf8"));
            MongoClient.connect(DB_CONN_USER, function(err, db) {
                var collection = db.collection("users");
                // collection.find({openid:retv.openid}).toArray(function(err, result) {
                //     res.jsonp(result);
                // });
                collection.findOne({openid:retv.openid}, function(err, item) {
                    // assert.equal(null, err);
                    if(item){
                        res.jsonp(item);
                    }else{
                        res.jsonp({openid:retv.openid, phonenumber:'0'});
                    }
                });
                db.close();
            });
        })
    }).on("error", function (err) {
        Logger.error(err.stack)
        callback.apply(null);
    })
});

app.get('/onSignup', function(req, res) {
    MongoClient.connect(DB_CONN_USER, function(err, db) {
        var collection = db.collection("users");
        var data = req.query;
        collection.findOne({openid:data.openid}, function(err, item) {
            if(item){
                res.send({stat:-1, msg:'您已注册'});
                db.close();
            }else{
                var obj = data;
                obj.cur_pkg = -1;
                obj.completed = 0;
                obj.unpaid = 0;
                collection.insert(obj, function(err, result) {
                    if(err){
                        // console.log('Error : ' + err);
                        res.send({stat:-1, msg:'注册失败'});
                    }else{
                        res.jsonp(obj);
                    }
                });
                db.close();
            }
        });
       // console.log(data);
       // collection.insert(data, function(err, result) {
       //     if(err){
       //         res.send('注册失败');
       //     }else{
       //         res.send('注册成功');
       //     }
       // });

        // db.close();
    });
});

app.get('/onModify', function(req, res) {
    MongoClient.connect(DB_CONN_USER, function(err, db) {
        var collection = db.collection('users');
        var data = req.query;
        collection.findOneAndUpdate({openid:data.openid}, {$set: data}, null, function(err2, r) {
            if(err2){
                res.send({stat:-1, msg:'修改失败'});
            }else{
                if(r.value){
                    res.send({stat:1, msg:'修改成功'});
                }else{
                    res.send({stat:-1, msg:'尚未注册'});
                }
            }
            db.close();
        });
    });
});

app.get('/onFetch', function(req, res) {
    MongoClient.connect(DB_CONN_USER, function(err, db) {
        var ucol = db.collection('users');
        ucol.findOne({openid:req.query.openid}, function(err2, item) {
            if(item){
                if(item.cur_pkg >= 0){
                    fs.readFile('/home/node_mongodb/public/text/zh/'+item.cur_pkg.toString()+'.zh', function(err3, data) {
                        res.jsonp({stat:1, text: data.toString(), pkgid: item.cur_pkg});
                    });
                    db.close();
                }else{
                    var pcol = db.collection('pkgs');
                    pcol.findOneAndUpdate({pstat:0}, {$set: {pstat:1}}, null, function(err4, r) {
                        if(r.value){
                            var cur_pkg = r.value.pkgid;
                            fs.readFile('/home/node_mongodb/public/text/zh/'+cur_pkg.toString()+'.zh', function(err5, data) {
                                res.jsonp({stat:1, text: data.toString(), pkgid: cur_pkg});
                            });
                            ucol.findOneAndUpdate({openid:req.query.openid}, {$set: {cur_pkg:cur_pkg}}, function(err6,r2){
                                db.close();
                            });
                        }else{
                            res.send({stat:-1, msg:'任务已经全部被领取'})
                            db.close();
                        }
                    });
                }
            }else{
                res.send({stat:-1, msg:'尚未注册'});
                db.close();
            }
        });
    });
});

var server = app.listen(8765, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})

