$(document).ready(function() {
  var socket = io.connect('http://localhost');

  socket.on('progress', function (data) {
    console.log(data);
    $("#progress").text("Progress: " + data.percent + '%');
    console.log(' progress so far so good');
  });

  $("#saveText").click(function() {    
    socket.emit('save', { val : $('#textarea').val(), sessionID: sessionID });
  });
});

