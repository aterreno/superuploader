var express = require('express')
  , form = require('connect-form')
  , app = express.createServer(form({ keepExtensions: true }))
  , io = require('socket.io').listen(app)
  , mongoose = require('mongoose')
  , util = require('util');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Upload = new Schema({
    user        : ObjectId
  , text        : String
  , sessionID   : String
  , filePath    : String  
});

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "supersecret" }));
  mongoose.connect('mongodb://localhost/superupload');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', function(req, res){
  res.render('index.jade', { title: 'SuperUploader', sessionID: req.sessionID });
});

app.post('/upload', function(req, res, next){

  req.form.complete(function(err, fields, files){
    if (err) {
      console.log(err);
      next(err);
    } else {
      console.log('\nuploaded %s to %s'
        ,  files.upload.filename
        , files.upload.path);
      res.redirect('back');
    }
  });

  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    
    io.sockets.on('connection', function (socket) {  
       socket.emit('progress', { percent: percent});
    });    
  });
});

io.sockets.on('connection', function (socket) {  
  socket.on('save', function (data) {
    var UploadModel = mongoose.model('Upload',Upload);
    var upload = new UploadModel({text: data.val, sessionID: data.sessionID});    
    UploadModel.update({sessionID: data.sessionID}, {$set: { text: data.val }}, {upsert: true}, function(err) {
      console.log(err);
    });    
  });
});
app.listen(80);
console.log('Express app started on port 80');