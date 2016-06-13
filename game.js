var canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
entities = [];

make_dots();
setInterval(game, 16);

function game() {
  update();
  render();
}

function update() {
  for (var i = 0; i < entities.length; i++) {
    entities[i].pos.x += 1;
    entities[i].pos.y += 1;
  }
}

function render() {
  //Clear Board
  ctx.clearRect(1, 0, canvas.width, canvas.height);
  //Draw Background
  ctx.fillStyle = "Black";
  ctx.rect( 0, 0, 300, 300 );
  ctx.fill();
  //Draw entities
  for (var i = 0; i < entities.length; i++) {
    draw(entities[i]);
  }
}

function draw(entity) {
  ctx.putImageData(entity.image, entity.pos.x, entity.pos.y)
}

function make_dots() {
  r = 3;//radius
  for (i = 0; i <= 10; i++) {
    var x = Math.floor(Math.random() * 299)
    var y = Math.floor(Math.random() * 299)

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    dot = ctx.getImageData(x, y, 30, 30);
    entities.push( { image: dot, pos: { x : x, y : y, r : r }} )
  }
}
