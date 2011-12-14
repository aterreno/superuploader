var socket = io.connect('http://localhost');
socket.on('progress', function (data) {
  console.log(data);    
}); 