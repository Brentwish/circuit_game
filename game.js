
function tile(x, y, val) {
  this.x = x;
  this.y = y;
  this.val = val;
}

tile.prototype.is_hall = function() {
  return this.val == 1;
}

tile.prototype.is_wall = function() {
  return this.val == 0;
}

tile.prototype.same_coords = function(coords) {
  return this.x == coords.x && this.y == coords.y;
}

tile.prototype.toString = function() {
  return String(this.x) + "," + String(this.y);
}

board = {
  width : 5,
  height : 3,
  tiles : new Array(),
  player_coord : { x: 0, y: 0 },
  get_tile_at : function(x, y) {
    return board.tiles[y][x]
  },
  generate : function() {
    var $table = $('<table />').appendTo('body');
    $table.attr('id', 'board');
    for (i = 0; i < board.height; i++) {
      board.tiles[i] = new Array();
      for (j = 0; j < board.width; j++) {
        board.tiles[i][j] = new tile(j, i, 0);
      }
    }
    board.draw()
  },
  draw : function() {
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

board.generate()
