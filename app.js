var express = require('express')
  , form = require('connect-form')
  , app = express.createServer(form({ keepExtensions: true }))
  , io = require('socket.io').listen(app);


app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', function(req, res){
  res.render('index.jade', { title: 'SuperUploader' });
});

app.post('/upload', function(req, res, next){

  req.form.complete(function(err, fields, files){
    if (err) {
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

app.listen(80);
console.log('Express app started on port 3000');