var Board = function(options) {
  this.width = options.width || 600;
  this.height = options.height || 800;
  this.delay = options.delay || 2000;
  this.numAsteroids = options.numAsteroids || 20;
  this.asteroidRadius = options.asteroidRadius || 10;
  this.scoreboard = new Scoreboard(50);

  this.scoreboard.start();

  this.svg = d3.select('body').append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
    .append('g');

  this.asteroids = undefined;
  this._hasCollidedRecently = false;

  this.players = [];
};

//Adds asteroids to the DOM
Board.prototype.makeAsteroids = function () {
  //Get reference to asteroid elements in 'g' element
  this.asteroids = this.svg.selectAll('image');

  //Updates the asteroids with new positions
  this._randomizeAsteroidData();

  //Appends asteroids to dom
  this.asteroids.enter().append('image');
};

Board.prototype._randomizeAsteroidData = function () {
  //Update the asteroid data to have new random positions
  var data = [];

  for (var i = 0; i < this.numAsteroids; i++) {
    var attrs = {};
    attrs['x'] = Math.random() * (this.width - this.asteroidRadius * 2);
    attrs['y'] = Math.random() * (this.height - this.asteroidRadius * 2);

    data.push(attrs);
  }

  this.asteroids = this.asteroids.data(data);
};

Board.prototype.moveAsteroidField = function () {
  this._hasCollidedRecently = false;
  this._randomizeAsteroidData();
  var board = this;
  this.asteroids
    .transition()
    .tween('jasenAndGregRule', function (d, i) {
      var el = d3.select(this);
      return function (t) {
        board._rotateAsteroid(el, t);
        if (board._checkCollision(el)) {
          board.scoreboard.reset();
        }
      };
    })
    .duration(this.delay)
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('width', this.asteroidRadius * 2)
    .attr('height', this.asteroidRadius * 2)
    .attr('xlink:href','asteroid.png')
    .attr('class', 'enemy');
  setTimeout(this.moveAsteroidField.bind(this), this.delay);
};

//Checks for collisions with players
Board.prototype._checkCollision = function(asteroid) {
  if (!(this._hasCollidedRecently)) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      //check whether enemy and player collide
      var xDistance = +asteroid.attr('x') + this.asteroidRadius - +player.el.attr('cx');
      var yDistance = +asteroid.attr('y') + this.asteroidRadius - +player.el.attr('cy');

      // see what is distance between enemy and hero
      var trueDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

      //if there is a collision, flag that a collision has
      //occurred in this "time step"
      //(there is a max of one collision per time step)
      if (trueDistance <= this.asteroidRadius + player.radius) {
        this._hasCollidedRecently = true;
        return true;
      }
    }
  }
  return false;
};

//Rotates the asteroid given
Board.prototype._rotateAsteroid = function(el, t) {
  var x = +el.attr('x') + this.asteroidRadius;
  var y = +el.attr('y') + this.asteroidRadius;
  var rotation = t * 720;

  el.attr('transform', 'rotate(' + rotation + ',' + x + ',' + y + ')');
};

Board.prototype.addPlayer = function(color) {
  var player = new Player(this, color, 10);
  this.players.push(player);
};

//A scoreboard class
var Scoreboard = function (scoreDelay) {
  this._scoreDelay = scoreDelay || 50;
  this._collSpan = d3.select('div.collisions').select('span');
  this._currSpan = d3.select('div.current').select('span');
  this._highSpan = d3.select('div.high').select('span');
};

Scoreboard.prototype.reset = function () {
  // increment collisions
  this._collSpan.text(this._collSpan.text() * 1 + 1);

  //Update high score
  if ((this._currSpan.text() * 1) > (this._highSpan.text() * 1)) {
    this._highSpan.text( this._currSpan.text() );
  }

  //Set scoreboard to zero
  this._currSpan.text(0);
};

Scoreboard.prototype.start = function () {
  setInterval(this._incrementScoreboard.bind(this), this._scoreDelay);
};

Scoreboard.prototype._incrementScoreboard = function () {
  this._currSpan.text(+this._currSpan.text() + 1);
};

//Creates a player class
var Player = function(board, color, radius) {
  this.radius = radius || 10;
  this.board = board;
  this._minX = this.radius;
  this._maxX = this.board.width - this.radius;
  this._minY = this.radius;
  this._maxY = this.board.height - this.radius;
  this.el = board.svg
    .append('circle')
    .attr('class', 'hero')
    .attr('fill', color)
    .attr('r', this.radius)
    .attr('cx', board.width/2)
    .attr('cy', board.height/2);
  this._enableDrag();
};

Player.prototype._enableDrag = function() {
  var player = this;
  var dragHero = function () {
    //Gets the amount that the mouse
    //has been dragged after the hero
    //element was clicked
    var dx = d3.event.dx;
    var dy = d3.event.dy;

    //Gets the current location of the
    //hero element
    var currentX = player.el.attr('cx') * 1;
    var currentY = player.el.attr('cy') * 1;

    var newX = currentX + dx;
    var newY = currentY + dy;

    //Prevents cheaters from moving hero
    //off screen
    if (newX > player.maxX) {
      newX = player.maxX;
    } else if (newX < player.minX) {
      newX = player.minX;
    }

    if (newY > player.maxY) {
      newY = player.maxY;
    } else if (newY < player.minY) {
      newY = player.minY;
    }

    //Move the hero to reflect the dragging
    player.el.attr('cx', newX).attr('cy', newY);
  };

  //Add drag event to hero
  var drag = d3.behavior.drag().on('drag', dragHero);

  player.el.call(drag);
};

//Executes the program

//Creates new board
var board = new Board({
  height:600,
  width:800,
  delay: 2000,
  numAsteroids: 20,
  asteroidRadius: 10,
});

//Create asteroids
board.makeAsteroids();

//Start asteroid field (also makes asteroids visible)
board.moveAsteroidField();

//Adds a player to the game
board.addPlayer('white');
