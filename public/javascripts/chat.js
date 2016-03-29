  var socket = io();
  var $ = jQuery;
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('user_connect', function(data){
    $('#messages').append($('<li>').text(data.data));
  });
  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });
