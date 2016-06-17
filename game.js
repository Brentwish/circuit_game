var background = document.getElementById("background");
var map = document.getElementById("map");
var sprites = document.getElementById("sprites");
var background_ctx = background.getContext("2d");
var sprites_ctx = sprites.getContext("2d");
var map_ctx = map.getContext("2d");
var num_bots = 10;
var entities = [];
var keys = [];
var BOARD_WIDTH = 300;
var BOARD_HEIGHT = 300;
var PLAYER_WIDTH = 30;
var PLAYER_HEIGHT = 30;

var board_data =  { type: 'background',
                    canvas: background,
                    ctx: background_ctx,
                    width: BOARD_WIDTH,
                    height: BOARD_HEIGHT,
                    boards:  {}
                  };
var map_data =    { type: 'map',
                    canvas: map,
                    ctx: map_ctx,
                    width: BOARD_WIDTH,
                    height: BOARD_HEIGHT,
                    boards:  {}
                  };
var board = new Board( board_data );
var map = new Board( map_data );
board.add_board(map);

var player_data = { type: 'player',
                    pos: { x: 10, y: 15 },
                    width: PLAYER_WIDTH,
                    height: PLAYER_HEIGHT,
                    image: player_image_gen('square', PLAYER_WIDTH, PLAYER_HEIGHT),
                    speed: 1,
                    board: board
                  };
var main_player = new Player( player_data );

var npc_data =    { type: 'npc',
                    image: bot_image_gen(),
                    pos: { x: 0, y: 0 },
                    speed: 1,
                    ai_type: 'random',
                    map: board
                  };
for (i = 0; i <= num_bots; i++) {
  entities.push(make_bot(npc_data));
}
entities.push(main_player);

setInterval(game, 16);
window.addEventListener('keydown', on_key_down, true);
window.addEventListener('keyup', on_key_up, true);

function game() {
  update();
  render();
}

function update() {
  for (var i = 0; i < entities.length; i++) {
    entity = entities[i]
    if (entity.type == 'npc') {
      entity.move();
    } else if (entity.type == 'player') {
      entity.move();
    }
  }
}

function render() {
  //Clear Board
  sprites_ctx.clearRect(0, 0, sprites.width, sprites.height);
  //Draw entities
  for (var i = 0; i < entities.length; i++) {
    sprites_ctx.putImageData(entities[i].image, entities[i].pos.x, entities[i].pos.y)
  }
}

function on_key_down(evt) {
  keys[evt.keyCode] = true
}

function on_key_up(evt) {
  keys[evt.keyCode] = false;
}

function make_bot(data) {
  var x = Math.floor(Math.random() * 299)
  var y = Math.floor(Math.random() * 299)
  var S = Math.sqrt(( x * x ) + ( y * y ))
  data.pos = { x: x, y: y };
  data.direction = { x: (data.speed/S) * x, y: (data.speed/S) * y };
  bot = new Npc(data)
  return bot;
}

/*
  Player Class
*/

function Player(data) {
  this.type = data.type
  this.image = data.image
  this.width = data.width
  this.height = data.height
  this.pos = data.pos
  this.speed = data.speed
  this.board = data.board
}

Player.prototype.move = function() {
  if (keys[37]) {
    this.move_left();
  }
  if (keys[38]) {
    this.move_up();
  }
  if (keys[39]) {
    this.move_right();
  }
  if (keys[40]) {
    this.move_down();
  }
}

Player.prototype.move_left = function() {
  if (this.in_bounds('l')) {
    this.pos.x -= this.speed;
  }
}
Player.prototype.move_up = function() {
  if (this.in_bounds('u')) {
    this.pos.y -= this.speed;
  }
}
Player.prototype.move_right = function() {
  if (this.in_bounds('r')) {
    this.pos.x += this.speed;
  }
}
Player.prototype.move_down = function() {
  if (this.in_bounds('d')) {
    this.pos.y += this.speed;
  }
}

Player.prototype.in_bounds = function(dir) {
  var is_in_bounds = true;
  var x = this.pos.x;
  var y = this.pos.y;
  var width = this.width / 2;
  var height = this.height / 2;

    if (dir == 'l') {
      x -= 1;
    }
    if (dir == 'u') {
      y -= 1;
    }
    if (dir == 'r') {
      x += 1;
    }
    if (dir == 'd') {
      y += 1;
    }

    if ( this.board.map.pixel_at(x, y).is_wall() ) {
      is_in_bounds = false;
    }
  return is_in_bounds;
}

/*
  End Player Class
*/

/*
  Board Class
*/

function Board(data) {
  this.type = data.type
  this.canvas = data.canvas
  this.ctx = data.ctx
  this.width = data.width
  this.height = data.height
  this.boards = data.boards

  if (this.type == 'background') {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = "White";
    this.ctx.rect( 0, 0, this.width, this.height);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, 0, this.width, 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, this.height - 2, this.width, 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, 0, 2, this.height);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( this.width - 2, 0, 2, this.height);
    this.ctx.fill();
  } else if (this.type == 'map') {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(245,0,0,0)";
    this.ctx.rect( 0, 0, this.width, this.height);
    this.ctx.fill();
  }

  this.image = this.ctx.getImageData(0, 0, this.width, this.height);

  this.add_board = function(board) {
    this.boards[board.type] = board;
  }
}


Board.prototype.render = function() {
  this.ctx.putImageData(this.image, 0, 0)
}

Board.prototype.pixel_at = function(x, y) {
  data = this.ctx.getImageData(x, y, 1, 1).data
  return { r: data[0],
           g: data[1],
           b: data[2],
           a: data[3],
           is_wall: function() {
             return ( this.r == 1 ? true : false )
           }
         }
}

/*
  End Board Class
*/

/*
  NPC Class
*/

function Npc(data) {
  this.type = data.type
  this.image = data.image
  this.pos = data.pos
  this.direction = data.direction
  this.speed = data.speed
  this.ai_type = data.ai_type
}

Npc.prototype.move = function() {
  this.pos.x += this.speed * this.direction.x;
  this.pos.y += this.speed * this.direction.y;

  if (( this.pos.x <= 1 ) || ( this.pos.x >= sprites.width - 1 )) {
    this.direction.x *= -1
  }
  if (( this.pos.y <= 1 ) || ( this.pos.y >= sprites.height - 1 )) {
    this.direction.y *= -1
  }
}

/*
  End NPC Class
*/

    // (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};

    //copies a 2d vector like object from one to another
pos = function(a) {
  return {x:a.x,y:a.y};
};

    //Add a 2d vector with another one and return the resulting vector
v_add = function(a,b) {
  return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() };
};

    //Subtract a 2d vector with another one and return the resulting vector
v_sub = function(a,b) {
  return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() };
};

    //Multiply a 2d vector with a scalar value and return the resulting vector
v_mul_scalar = function(a,b) {
  return {x: (a.x*b).fixed() , y:(a.y*b).fixed() };
};

    //Simple linear interpolation
lerp = function(p, n, t) {
  var _t = Number(t);
  _t = (Math.max(0, Math.min(1, _t))).fixed();
  return (p + _t * (n - p)).fixed();
};

    //Simple linear interpolation between 2 vectors
v_lerp = function(v, tv, t) {
  return { x: lerp(v.x, tv.x, t), y: lerp(v.y, tv.y, t) };
};

/*
  Graphics Generation
*/

function player_image_gen(type, width, height) {
  if (type == 'square') {
    sprites_ctx.beginPath();
    sprites_ctx.fillStyle = "Gray";
    sprites_ctx.rect(0, 0, width, height);
    sprites_ctx.fill();
    return sprites_ctx.getImageData(0, 0, width, height);
  }
}

function bot_image_gen() {
  r = 4
  sprites_ctx.fillStyle = "Red";

  sprites_ctx.beginPath();
  sprites_ctx.arc(r, r, r, 0, Math.PI * 2, true);
  sprites_ctx.closePath();
  sprites_ctx.fill();
  return sprites_ctx.getImageData(0, 0, 2*r, 2*r);
}


//End
