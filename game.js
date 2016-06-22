var background = document.getElementById("background");
var map = document.getElementById("map");
var sprites = document.getElementById("sprites");
var background_ctx = background.getContext("2d");
var sprites_ctx = sprites.getContext("2d");
var map_ctx = map.getContext("2d");
var num_bots = 0;
var entities = [];
var keys = [];
var BOARD_WIDTH = 300;
var BOARD_HEIGHT = 300;
var PLAYER_WIDTH = 30;
var PLAYER_HEIGHT = 30;

var board_data =  {
  type: 'background',
  canvas: background,
  ctx: background_ctx,
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  boards:  {}
};
var map_data = {
  type: 'map',
  canvas: map,
  ctx: map_ctx,
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  boards:  {}
};
var board = new Board( board_data );
var map = new Board( map_data );
board.add_board(map);

var player_data = {
  //General Properties
  type: 'player',
  image: player_image_gen('square', PLAYER_WIDTH, PLAYER_HEIGHT),
  board: board,
  //Spatial Properties
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  bounding_box: get_bounding_box( { image: player_image_gen('square', PLAYER_WIDTH, PLAYER_HEIGHT) } ),
  quad_node: entities,
  //Movement Properties
  speed: 2,
  position: new Vector(10, 15),
  direction: new Vector(0, 0),
  velocity: new Vector(0, 0),
  acceleration: new Vector(10, 15)
};
var main_player = new Entity( player_data );

//var npc_data = {
//  type: 'npc',
//  image: bot_image_gen(),
//  pos: { x: 0, y: 0 },
//  speed: 1,
//  ai_type: 'random',
//  map: board,
//  bounding_box: get_bounding_box( { image: bot_image_gen() } )
//};
//for (i = 0; i <= num_bots; i++) {
//  entities.push(make_bot(npc_data));
//}
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
    sprites_ctx.putImageData(entities[i].image, entities[i].position.x, entities[i].position.y);
  }
}

function on_key_down(evt) {
  keys[evt.keyCode] = true;
}

function on_key_up(evt) {
  keys[evt.keyCode] = false;
}

function make_bot(data) {
  var x = Math.floor(Math.random() * 299);
  var y = Math.floor(Math.random() * 299);
  var S = Math.sqrt(( x * x ) + ( y * y ));
  data.pos = { x: x, y: y };
  data.direction = { x: (data.speed/S) * x, y: (data.speed/S) * y };
  bot = new Npc(data);
  return bot;
}

function Vector(x, y) {
  this.x = x
  this.y = y
}

Vector.prototype.normalize = function(scalar) {
  if ( scalar === undefined ) scalar = 1;
  var S = Math.sqrt(( this.x * this.x ) + ( this.y * this.y ));
  return new Vector( {
    x: this.x === 0 ? 0 : ( scalar/S * this.x ).fixed(3),
    y: this.y === 0 ? 0 : ( scalar/S * this.y ).fixed(3)
  } );
}

Vector.prototype.line_between = function(p1) {
  return {
    y: function(x) {
      return ( p1.y + ( this.y - p1.y ) * ( x - p1.x ) / ( this.x - p1.x ) );
    }.bind(this),
    x: function(y) {
      return ( p1.x + ( this.x - p1.x ) * ( y - p1.y ) / ( this.y - p1.y ) );
    }.bind(this)
  }
}

/*
  Entity Class
*/

function Entity(data) {
  //General Properties
  this.type = data.type;
  this.image = data.image;
  this.board = data.board;

  //Spatial Properties
  this.width = data.width;
  this.height = data.height;
  this.bounding_box = data.bounding_box;
  this.quad_node = data.quad_node;

  //Movement Properties
  this.position = data.position;
  this.direction = data.direction;
  this.speed = data.speed;
  this.velocity = data.velocity;
  this.acceleration = data.acceleration;
}

Entity.prototype.move = function() {
  if ( this.type == 'player' ) {
    if (keys.length == 0) return;
    this.direction.x = 0;
    this.direction.y = 0;

    //left
    if (keys[37]) this.direction.x -= 1;
    //up
    if (keys[38]) this.direction.y -= 1;
    //right
    if (keys[39]) this.direction.x += 1;
    //down
    if (keys[40]) this.direction.y += 1;
  }
  this.velocity = this.direction.normalize(this.speed);
  this.bounding_box.width += this.velocity.x;
  this.bounding_box.height += this.velocity.y;
  var flag = true;
  for ( i = 0; i < this.quad_node.length; i++ ) {
    if ( this == this.quad_node[i] ) continue;
    if ( is_intersecting(this.bounding_box, this.quad_node[i].bounding_box) ) {
      //Further check is required
      var flag = false;
    }
  }

  if (flag) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

}

Entity.prototype.is_bounding_box_intersecting = function() {
  var P1 = new Vector(0,0);
  var P2 = new Vector(0,0);
  var P3 = new Vector(0,0);
  var P4 = new Vector(0,0);
  var L1, L2;

  //The lines we want to check are based off which direction the velocity is. This determines the terminal points of the lines
  //we are interested.
  if ( (this.velocity.x > 0 && this.velocity.y > 0) || (this.velocity.x < 0 && this.velocity.y < 0) ) {
    P1.x = this.position.x + this.width;
    P1.y = this.position.y;
    P3.x = this.position.x;
    P3.y = this.position.y + this.height;
  }
  if ( (this.velocity.x > 0 && this.velocity.y < 0) || (this.velocity.x < 0 && this.velocity.y > 0) ) {
    P1 = this.position;
    P3.x = this.position.x + this.width;
    P3.y = this.position.y + this.height;
  }
  if (this.velocity.x == 0 && this.velocity.y > 0) {
    P1.x = this.position.x;
    P1.y = this.position.y + this.height;
    P3.x = this.position.x + this.width;
    P3.y = this.position.y + this.height;
  }
  if (this.velocity.x == 0 && this.velocity.y < 0) {
    P1.x = this.position.x;
    P1.y = this.position.y;
    P3.x = this.position.x + this.width;
    P3.y = this.position.y;
  }
  if (this.velocity.x > 0 && this.velocity.y == 0) {
    P1.x = this.position.x + this.width;
    P1.y = this.position.y;
    P3.x = this.position.x + this.width;
    P3.y = this.position.y + this.height;
  }
  if (this.velocity.x < 0 && this.velocity.y == 0) {
    P1.x = this.position.x;
    P1.y = this.position.y;
    P3.x = this.position.x;
    P3.y = this.position.y + this.height;
  }
  P2.x = P1.x + this.velocity.x;
  P2.y = P1.y + this.velocity.y;
  P4.x = P3.x + this.velocity.x;
  P4.y = P3.y + this.velocity.y;

  L1 = P1.line_between(P2);
  L2 = P3.line_between(P4);

  for ( i = 0; i < this.quad_node.length; i++ ) {
    if ( this == quad_node[i] ) continue;
    for ( j = 0; j < 4; j++ ) {
      x = quad_node[i].bounding_box.corners[j].x;
      y = quad_node[i].bounding_box.corners[j].y;
      if ( x >= min_x && x <= max_x && y >= min_y && y <= max_y ) {
        if ( L1.y(x) <= y && L2.y(x) >= y ) {
        }
      }
    }
  }
}

/*
  Player Class
*/

function Player(data) {
  this.type = data.type
  this.image = data.image
  this.bounding_box = data.bounding_box
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

  if (dir == 'l') {
    x -= 1;
  }
  if (dir == 'u') {
    y -= 1;
  }
  if (dir == 'r') {
    x += this.width;
  }
  if (dir == 'd') {
    y += this.height;
  }
  for (i = 0; i < entities.length; i++) {
    if (this == entities[i]) continue
    if (is_intersecting(this.center_bb(), entities[i].center_bb())) {
      is_in_bounds = false;
    }
  }
  if ( this.board.pixel_at(x, y).is_wall ) {
    is_in_bounds = false;
  }
  return is_in_bounds;
}

Player.prototype.center_bb = function() {
  return {
    left: this.bounding_box.left + this.pos.x,
    right: this.bounding_box.right + this.pos.x,
    upper: this.bounding_box.upper + this.pos.y,
    lower: this.bounding_box.lower + this.pos.y
  }
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
  } //else if (this.type == 'map') {
    //this.ctx.clearRect(0, 0, this.width, this.height);
    //this.ctx.beginPath();
    //this.ctx.fillStyle = "rgba(245,0,0,.01)";
    //this.ctx.rect( 0, 0, this.width, this.height);
    //this.ctx.fill();
  //}

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
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    a: data[3],
    is_wall: (( data[0] == 0 && data[1] == 0 && data[2] == 0 && data[3] == 255) ? true : false )
  }
}

/*
  End Board Class
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
    sprites_ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
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

  sprites_ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  sprites_ctx.beginPath();
  sprites_ctx.arc(r, r, r, 0, Math.PI * 2, true);
  sprites_ctx.closePath();
  sprites_ctx.fill();
  return sprites_ctx.getImageData(0, 0, 2*r, 2*r);
}

function get_bounding_box(entity, alphaThreshold){
  if ( alphaThreshold === undefined ) alphaThreshold = 15;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  var data = entity.image.data;
  for ( var x = 0; x < entity.image.width; ++x ) {
    for (var y = 0; y < entity.image.height; ++y ) {
      var a = data[ ( entity.image.width * y + x ) * 4 + 3 ];
      if ( a > alphaThreshold ) {
        if ( x > maxX ) maxX = x;
        if ( x < minX ) minX = x;
        if ( y > maxY ) maxY = y;
        if ( y < minY ) minY = y;
      }
    }
  }
  return {
    width: maxX - minX,
    height: maxY - minY
  };
}

function is_intersecting(r1, r2) {
  return !( r2.left > r1.right ||
    r2.right < r1.left ||
    r2.upper > r1.bottom ||
    r2.bottom < r1.upper );
}
//End

///*
//  NPC Class
//*/
//
//function Npc(data) {
//  this.type = data.type;
//  this.image = data.image;
//  this.pos = data.pos;
//  this.direction = data.direction;
//  this.speed = data.speed;
//  this.ai_type = data.ai_type;
//  this.bounding_box = data.bounding_box;
//}
//
//Npc.prototype.move = function() {
//  var is_in_bounds = true;
//  for (i = 0; i < entities.length; i++) {
//    if (this == entities[i]) continue
//    if (is_intersecting(this.center_bb(), entities[i].center_bb())) {
//      is_in_bounds = false;
//    }
//  }
//  if (is_in_bounds) {
//    this.pos.x += this.speed * this.direction.x;
//    this.pos.y += this.speed * this.direction.y;
//  }
//  if (( this.pos.x <= 1 ) || ( this.pos.x >= sprites.width - 1 )) {
//    this.direction.x *= -1;
//  }
//  if (( this.pos.y <= 1 ) || ( this.pos.y >= sprites.height - 1 )) {
//    this.direction.y *= -1;
//  }
//}
//
//Npc.prototype.center_bb = function() {
//  return {
//    left: this.bounding_box.left + this.pos.x,
//    right: this.bounding_box.right + this.pos.x,
//    upper: this.bounding_box.upper + this.pos.y,
//    lower: this.bounding_box.lower + this.pos.y
//  }
//}
//
///*
//  End NPC Class
//*/
//  var flag = true;
//  while ( flag ) {
//    this.speed /= 2;
//    if ( this.speed < 1 ) {
//      this.speed = 1;
//      flag = false;
//    }
//
//    this.velocity = this.velocity.normalize(this.speed);
//    for ( i = 0; i <= this.quad_node.length; i++ ) {
//      backward = false;
//      if ( this == this.quad_node[i] ) continue;
//      if ( is_intersecting(this.bounding_box, this.quad_node[i].bounding_box) ) {
//        backward = true;
//        break;
//      }
//    }
//    this.bounding_box.translate(this.velocity, backward);
//  }
//  this.position.x = this.bounding_box.left;
//  this.position.y = this.bounding_box.upper;
