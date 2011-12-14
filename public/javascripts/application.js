var socket = io.connect('http://localhost');
socket.on('progress', function (data) {
  $("#progress").text("Progress: " + data.percent + '%');
}); 