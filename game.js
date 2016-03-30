var $table = $('<table />').appendTo('body');
$table.attr('id', 'board');

board = {
  width        : 5,
  height       : 3,
  player_coord : { x: 0, y: 0 },
  draw         : function() {
    $('#board').empty()
    for (var i = 0; i < board.height; i++) {
      var tr = $('<tr>')
      for (var j = 0; j < board.width; j++) {
        var td = $('<td>')
          .attr('name', String(i) + "," + String(j))
          .addClass("tile")
        tr.append(td)
      }
      $('#board').append(tr)
    }
  }
}
board.draw()
