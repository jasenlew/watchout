// start slingin' some d3 here.

var width = 800;
var height = 600;
var heroColor = 'white';
var enemyColor = 'green';
var radius = 10;
var numEnemies = 5;
var moveDelay = 2000;

var minHeroX = radius;
var maxHeroX = width - radius;

var minHeroY = radius;
var maxHeroY = height - radius;

var hasCollidedRecently = false;

//Get reference to (and create) svg element with nested 'g' element
var svg = d3.select('body').append('svg').attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('fill', enemyColor);

//Get reference to asteroid elements in 'g' element
var asteroids = svg.selectAll('img');

//Adds a hero asteroid after all the other guys have been selected
var hero = svg
  .append('circle')
  .attr('class', 'hero')
  .attr('fill', heroColor)
  .attr('r', radius)
  .attr('cx', width/2)
  .attr('cy', height/2);

var dragHero = function () {
  //Gets the amount that the mouse
  //has been dragged after the hero
  //element was clicked
  var dx = d3.event.dx;
  var dy = d3.event.dy;

  //Gets the current location of the
  //hero element
  var currentX = hero.attr('cx') * 1;
  var currentY = hero.attr('cy') * 1;

  var newX = currentX + dx;
  var newY = currentY + dy;

  //Prevents cheaters from moving hero
  //off screen
  if (newX > maxHeroX) {
    newX = maxHeroX;
  } else if (newX < minHeroX) {
    newX = minHeroX;
  }

  if (newY > maxHeroY) {
    newY = maxHeroY;
  } else if (newY < minHeroY) {
    newY = minHeroY;
  }

  //Move the hero to reflect the dragging
  hero.attr('cx', newX).attr('cy', newY);
};

//Add drag event to hero
var drag = d3.behavior.drag().on('drag', dragHero);

hero.call(drag);

//Update the asteroid data to have new random positions
var updateWithRandomAsteroidData = function () {
  var data = [];

  for (var i = 0; i < numEnemies; i++) {
    var attrs = {};
    attrs['x'] = Math.random() * (width - radius * 2);
    attrs['y'] = Math.random() * (height - radius * 2);

    data.push(attrs);
  }
  asteroids = asteroids.data(data);
};

//Updates the asteroids with new positions
updateWithRandomAsteroidData();

//Appends asteroids to dom
asteroids.enter().append('image');

//Check collision for the given enemy
var checkCollision = function (enemyElement) {
  if (!(hasCollidedRecently)) {
    //check whether enemy and hero collide
    var xDistance = enemyElement.attr('x') * 1 + radius - hero.attr('cx') * 1;
    var yDistance = enemyElement.attr('y') * 1  + radius - hero.attr('cy') * 1;

    // see what is distance between enemy and hero
    var trueDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

    //if there is a collision, flag that a collision has
    //occurred in this "time step"
    //(there is a max of one collision per time step)
    if (trueDistance <= radius * 2) {
      hasCollidedRecently = true;
      return true;
    }
  }
  return false;
};

var resetScoreboard = function () {
  //Quick access to elements
  var collSpan = d3.select('div.collisions').select('span');
  var currSpan = d3.select('div.current').select('span');
  var highSpan = d3.select('div.high').select('span');

  // increment collisions
  collSpan.text(collSpan.text() * 1 + 1);

  //Update high score
  if ((currSpan.text() * 1) > (highSpan.text() * 1)) {
    highSpan.text( currSpan.text() );
  }

  //Set scoreboard to zero
  currSpan.text(0);
};

//Increments the scoreboard when called
var incrementScoreboard = function() {
  var currSpan = d3.select('div.current').select('span');
  currSpan.text(currSpan.text() * 1 + 1);
};

setInterval(incrementScoreboard, 50);

//Moves the asteroids to new random locations
var moveAsteroids = function() {
  hasCollidedRecently = false;
  updateWithRandomAsteroidData();
  asteroids
    .transition()
    .tween('jasenAndGregoryRule', function (d, i) {
      var el = d3.select(this);
      return function (t) {
        rotateEnemy(el, t);
        if (checkCollision(el)) {
          resetScoreboard();
        }
      };
    })
    .duration(moveDelay)
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('width', radius * 2)
    .attr('height', radius * 2)
    .attr('xlink:href','asteroid.png')
    .attr('class', 'enemy');
  setTimeout(moveAsteroids, moveDelay);
};

var rotateEnemy = function (el, t) {
  var x = +el.attr('x') + radius;
  var y = +el.attr('y') + radius;
  var rotation = t * 720;

  el.attr('transform', 'rotate(' + rotation + ',' + x + ',' + y + ')');
};

moveAsteroids();
