$(document).ready(function() {
  var socket = io.connect('http://localhost');

  console.log('befo so far so good');
  socket.on('progress', function (data) {
    console.log(' socket.on so far so good');
    console.log(data);
    $("#progress").text("Progress: " + data.percent + '%');
    console.log(' progress so far so good');
  });

  console.log('so far so good saveText');
  $("#saveText").click(function() {    
    socket.emit('save', { val : $('#textarea').val(), sessionID: sessionID });
  });
});

