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
  entities: entities,
  boards:  {}
};
var map_data = {
  type: 'map',
  canvas: map,
  ctx: map_ctx,
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT,
  entities: entities,
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
make_walls();

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

function make_walls() {
  var image, x, y, width, height;
  var wall_data = {
    //General Properties
    type: 'wall',
    image: null,
    board: board,
    //Spatial Properties
    width: null,
    height: null,
    quad_node: entities,
    //Movement Properties
    speed: null,
    position: new Vector(0,0),
    direction: null,
    velocity: null,
    acceleration: null
  }
  wall_data.width = sprites.width;
  wall_data.height = 2
  wall_data.position = new Vector(0, 0);
  wall_data.image = make_rect(sprites, 0, 0, wall_data.width, 2);
  entities.push(new Entity(wall_data));

  wall_data.width = sprites.width;
  wall_data.height = 2
  wall_data.position = new Vector(0, sprites.height - 2);
  wall_data.image = make_rect(sprites, 0, sprites.height - 2, wall_data.width, 2);
  entities.push(new Entity(wall_data));

  wall_data.width = 2;
  wall_data.height = sprites.height
  wall_data.position = new Vector(0, 0);
  wall_data.image = make_rect(sprites, 0, 0, 2, sprites.height);
  entities.push(new Entity(wall_data));

  wall_data.width = 2;
  wall_data.height = sprites.height
  wall_data.position = new Vector(sprites.width - 2, 0);
  wall_data.image = make_rect(sprites, sprites.width - 2, 0, 2, sprites.height);
  entities.push(new Entity(wall_data));
}

function make_rect(c, x, y, width, height) {
  ctx = c.getContext("2d");
  ctx.clearRect(0,0,ctx.width,ctx.height);
  ctx.beginPath();
  ctx.fillStyle = "Black";
  ctx.rect( x, y, width, height);
  ctx.fill();
  return ctx.getImageData(x,y,width,height);
}

function Vector(x, y) {
  this.x = x
  this.y = y
}

Vector.prototype.normalize = function(scalar) {
  if ( scalar === undefined ) scalar = 1;
  var S = Math.sqrt(( this.x * this.x ) + ( this.y * this.y ));
  return new Vector(
    this.x === 0 ? 0 : ( scalar/S * this.x ).fixed(3),
    this.y === 0 ? 0 : ( scalar/S * this.y ).fixed(3)
  );
}

Vector.prototype.line_between = function(p1) {
  x_range = get_range(p1.x, this.x);
  y_range = get_range(p1.y, this.y);
  return {
    y: function(x) {
      return ( p1.y + ( this.y - p1.y ) * ( x - p1.x ) / ( this.x - p1.x ) );
    }.bind(this),
    x: function(y) {
      return ( p1.x + ( this.x - p1.x ) * ( y - p1.y ) / ( this.y - p1.y ) );
    }.bind(this),
    x_slope: (this.x - p1.x) / (this.y - p1.y),
    y_slope: (this.y - p1.y) / (this.x - p1.x),
    x_range: x_range,
    y_range: y_range,
    min_x : x_range[0],
    min_y : y_range[0],
    max_x : x_range[1],
    max_y : y_range[1]
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
  this.quad_node = data.quad_node;

  //Movement Properties
  this.position = data.position;
  this.direction = data.direction;
  this.speed = data.speed;
  this.velocity = data.velocity;
  this.acceleration = data.acceleration;

  //Get Bounding Box
  this.bounding_box = (function(alphaThreshold) {
    if ( alphaThreshold === undefined ) alphaThreshold = 15;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var data = this.image.data;
    for ( var x = 0; x < this.image.width; ++x ) {
      for (var y = 0; y < this.image.height; ++y ) {
        var a = data[ ( this.image.width * y + x ) * 4 + 3 ];
        if ( a > alphaThreshold ) {
          if ( x > maxX ) maxX = x;
          if ( x < minX ) minX = x;
          if ( y > maxY ) maxY = y;
          if ( y < minY ) minY = y;
        }
      }
    }
    return {
      corners: [new Vector(minX,minY), new Vector(maxX,minY), new Vector(maxX,maxY), new Vector(minX,maxY)],
      width: maxX - minX,
      height: maxY - minY,
      min_x: minX + this.position.x,
      max_x: maxX + this.position.x,
      min_y: minY + this.position.y,
      max_y: maxY + this.position.y
    };
  }).bind(this)();
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
  if (this.direction.x == 0 && this.direction.y == 0) return;
  this.velocity = this.direction.normalize(this.speed);
  this.get_furthest_movement();

  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.bounding_box.min_x = this.position.x;
  this.bounding_box.min_y = this.position.y;
  this.bounding_box.max_x = this.position.x + this.width;
  this.bounding_box.max_y = this.position.y + this.height;
}

Entity.prototype.get_furthest_movement = function() {
  for ( var i = 0; i < this.quad_node.length; i++ ) {
    var entity = this.quad_node[i];
    if (this == entity) continue;

    if ( this.velocity.x > 0 ) {
      if ( entity.bounding_box.min_x >= this.bounding_box.max_x ) {
        if ( entity.bounding_box.min_x <= this.bounding_box.max_x + this.velocity.x ) {
          y_range = get_range(entity.position.y, entity.position.y + entity.height);
          if (( this.position.y >= y_range[0] && this.position.y <= y_range[1] ) ||
             ( this.position.y + this.height >= y_range[0] && this.position.y + this.height <= y_range[1] )) {
            this.velocity.x = entity.bounding_box.min_x - this.bounding_box.max_x;
          }
        }
      }
    } else if ( this.velocity.x < 0 ) {
      if ( entity.bounding_box.max_x <= this.bounding_box.min_x ) {
        if ( entity.bounding_box.max_x >= this.bounding_box.min_x + this.velocity.x ) {
          y_range = get_range(entity.position.y, entity.position.y + entity.height);
          if (( this.position.y >= y_range[0] && this.position.y <= y_range[1] ) ||
             ( this.position.y + this.height >= y_range[0] && this.position.y + this.height <= y_range[1] )) {
            this.velocity.x = entity.bounding_box.max_x - this.bounding_box.min_x;
          }
        }
      }
    }

    if ( this.velocity.y > 0 ) {
      if ( entity.bounding_box.min_y >= this.bounding_box.max_y ) {
        if ( entity.bounding_box.min_y <= this.bounding_box.max_y + this.velocity.y ) {
          x_range = get_range(entity.position.x, entity.position.x + entity.width);
          if (( this.position.x >= x_range[0] && this.position.x <= x_range[1] ) ||
             ( this.position.x + this.width >= x_range[0] && this.position.x + this.width <= x_range[1] )) {
            this.velocity.y = entity.bounding_box.min_y - this.bounding_box.max_y;
          }
        }
      }
    } else if ( this.velocity.y < 0 ) {
      if ( entity.bounding_box.max_y <= this.bounding_box.min_y ) {
        if ( entity.bounding_box.max_y >= this.bounding_box.min_y + this.velocity.y ) {
          x_range = get_range(entity.position.x, entity.position.x + entity.width);
          if (( this.position.x >= x_range[0] && this.position.x <= x_range[1] ) ||
             ( this.position.x + this.width >= x_range[0] && this.position.x + this.width <= x_range[1] )) {
            this.velocity.y = entity.bounding_box.max_y - this.bounding_box.min_y;
          }
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

  //this.ctx.clearRect(0, 0, this.width, this.height); //Class constructer => the board is already clear.
  if (this.type == 'background') {
    this.ctx.beginPath();
    this.ctx.fillStyle = "White";
    this.ctx.rect( 0, 0, this.width, this.height);
    this.ctx.fill();

  } else if (this.type == 'map') {

    //Top Wall
    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, 0, this.width, 2);
    this.ctx.fill();

    //Bottom Wall
    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, this.height - 2, this.width, 2);
    this.ctx.fill();

    //Left Wall
    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( 0, 0, 2, this.height);
    this.ctx.fill();

    //Right Wall
    this.ctx.beginPath();
    this.ctx.fillStyle = "Black";
    this.ctx.rect( this.width - 2, 0, 2, this.height);
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

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}

function get_range(a, b) {
  return a == b ? [a, a] : (a < b ? [a, b] : [b, a]);
}

function contains(val, range) {
  return val >= range[0] && val <= range[1];
}
//End
