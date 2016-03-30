var $table = $('<table />').appendTo('body');
$table.attr('id', 'board');

var board_height = 3
var board_width = 5
var jboard = '#board'

var draw_board = function() {
  $(jboard).empty()
  for (var i = 0; i < board_height; i++) {
    var tr = $('<tr>')
    for (var j = 0; j < board_width; j++) {
      var td = $('<td>')
        .attr('name', String(i) + "," + String(j))
        .addClass("tile")
      tr.append(td)
    }
    $(jboard).append(tr)
  }
}
draw_board()
