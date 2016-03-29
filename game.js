var $table = $('<table />').appendTo('body');
$table.attr('id', 'board');

var board_height = 3
var board_width = 5
var jboard = '#board'

$(jboard).empty();
for (var i = 0; i < board_height; i++) {
  var tr = $('<tr>');
  for (var j = 0; j < board_width; j++) {
    var td = $('<td>')
      .attr('name', String(i) + "," + String(j))
    tr.append(td);
  }
  $(jboard).append(tr);
}
