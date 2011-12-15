$(document).ready(function() {
  var socket = io.connect('http://localhost');

  socket.on('progress', function (data) {
    $("#progress").text("Progress: " + data.percent + '%');
  });

  $("#saveText").click(function() {    
    socket.emit('save', { val : $('#textarea').val(), sessionID: sessionID });
  });
});

