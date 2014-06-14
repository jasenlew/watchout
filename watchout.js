// start slingin' some d3 here.

var width = 800;
var height = 600;
var heroColor = 'black';
var enemyColor = 'green';
var circleRadius = 10;
var numEnemies = 50;
var moveDelay = 2000;

var minHeroX = circleRadius;
var maxHeroX = width - circleRadius;

var minHeroY = circleRadius;
var maxHeroY = height - circleRadius;

//Get reference to (and create) svg element with nested 'g' element
var svg = d3.select('body').append('svg').attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('fill', enemyColor);

//Get reference to circle elements in 'g' element
var circles = svg.selectAll('circle');

//Adds a hero circle after all the other guys have been selected
var hero = svg
  .append('circle')
  .attr('class', 'hero')
  .attr('fill', heroColor)
  .attr('r', circleRadius)
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

//Update the circle data to have new random positions
var updateWithRandomCircleData = function () {
  var data = [];

  for (var i = 0; i < numEnemies; i++) {
    var attrs = {};
    attrs['cx'] = Math.random() * (width - circleRadius * 2) + circleRadius;
    attrs['cy'] = Math.random() * (height - circleRadius * 2) + circleRadius;
    data.push(attrs);
  }
  circles = circles.data(data);
};

//Updates the circles with new positions
updateWithRandomCircleData();

//Appends circles to dom
circles.enter().append('circle');

//Check collision for the given enemy
var checkCollision = function (enemyElement) {
  //check whether enemy and hero collide
  var xDistance = enemyElement.attr('cx') * 1 - hero.attr('cx') * 1;
  var yDistance = enemyElement.attr('cy') * 1 - hero.attr('cy') * 1;

  // see what is distance between enemy and hero
  var trueDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

  return trueDistance <= circleRadius * 2;
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

//Moves the circles to new random locations
var moveCircles = function() {
  updateWithRandomCircleData();
  circles
    .transition()
    .tween('jasenAndGregoryRule', function (d, i) {
      var el = d3.select(this);
      return function (t) {
        if (checkCollision(el)) {
          resetScoreboard();
        }
      };
    })
    .duration(moveDelay)
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .attr('r', circleRadius)
    .attr('class', 'enemy');
  setTimeout(moveCircles, moveDelay);
};

moveCircles();
