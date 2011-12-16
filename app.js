var express = require('express'), 
    form = require('connect-form'), 
    app = express.createServer(form({ keepExtensions: true })),
    io = require('socket.io').listen(app), 
    mongoose = require('mongoose'), 
    util = require('util'), 
    progressEvent = new require('./progressEvent').ProgressEvent();

var Schema = mongoose.Schema;

var Upload = new Schema({    
    text        : String
  , sessionID   : String
  , filePath    : String
  , filename    : String  
});

var UploadModel = mongoose.model('Upload',Upload);

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
      UploadModel.update({sessionID: req.sessionID}, {$set: { filePath: files.upload.path, filename: files.upload.filename  }}, {upsert: true}, function(err) {
        console.log(err);
      });    
      res.redirect('back');
    }
  });

  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    // progressEvent.download(percent);

    io.sockets.on('connection', function (socket) {        
      socket.emit('progress', { percent: percent});
      client = socket;
      });        
  });
});

io.sockets.on('connection', function (socket) {
  // progressEvent.on('progress', function(percentage) {
  //   console.log(percentage);
  //   socket.emit('progress', { percent: percentage});
  // });

  socket.on('save', function (data) {
    console.log("onSave");
    UploadModel.update({sessionID: data.sessionID}, {$set: { text: data.val }}, {upsert: true}, function(err) {
      console.log(err);
    });    
  });
});
app.listen(80);
console.log('Superupload application up and running');