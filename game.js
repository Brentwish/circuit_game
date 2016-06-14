var background = document.getElementById("background");
var sprites = document.getElementById("sprites");
background_ctx = background.getContext("2d");
sprites_ctx = sprites.getContext("2d");
entities = [];

make_dots();
setInterval(game, 16);

function game() {
  update();
  render();
}

function update() {
  for (var i = 0; i < entities.length; i++) {
    entity = entities[i]
    entity.pos.x += entity.speed * entity.direction.x;
    entity.pos.y += entity.speed * entity.direction.y;

    if (( entity.pos.x <= 1 ) || ( entity.pos.x >= sprites.width - 1 )) {
      entity.direction.x *= -1
    }
    if (( entity.pos.y <= 1 ) || ( entity.pos.y >= sprites.height - 1 )) {
      entity.direction.y *= -1
    }
  }
}

function render() {
  //Clear Board
  sprites_ctx.clearRect(0, 0, sprites.width, sprites.height);

  //Draw Background
  background_ctx.fillStyle = "Black";
  background_ctx.rect( 0, 0, 300, 300 );
  background_ctx.fill();

  //Draw entities
  for (var i = 0; i < entities.length; i++) {
    draw(entities[i]);
  }
}

function draw(entity) {
  sprites_ctx.putImageData(entity.image, entity.pos.x, entity.pos.y)
}

function make_dots() {
  r = 4;//radius
  for (i = 0; i <= 10; i++) {
    var x = Math.floor(Math.random() * 299)
    var y = Math.floor(Math.random() * 299)

    sprites_ctx.fillStyle = "white";

    sprites_ctx.beginPath();
    sprites_ctx.arc(x, y, r, 0, Math.PI * 2, true);
    sprites_ctx.closePath();
    sprites_ctx.fill();
    dot = sprites_ctx.getImageData(x - r, y - r, 2*r, 2*r);
    entities.push( { image: dot,
                     pos: { x : x, y : y, r : r },
                     speed: 1,
                     direction: { x: 1, y: 1 }
                   } )
  }
}
