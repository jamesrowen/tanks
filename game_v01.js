// -----------------------------------------------------------------------------
// game.js
// 
//
// Author: James Rowen - jamesrowen@gmail.com
// Date: 4/7/12
// -----------------------------------------------------------------------------


gameState = 0;		// simple game state management. 0 = player turn, 1 = AI turn, 2 = game over
gameText = ""		// informational text displayed to the player

dt = 0;			// timing snapshot
lastTimestamp = 0;


messages = [];

objects = [];

var myPlayer = '';

images = [];

worldmap = [
	[0, 1, 2, 3, 4, 11, 17, 6, 12, 3, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[5, 6, 1, 0, 3, 20, 0, 16, 21, 4, 10, 11, 12, 13, 14, 2, 15, 12, 5, 1],
	[10, 11, 12, 13, 14, 2, 15, 12, 5, 1, 4, 6, 16, 11, 20, 3, 0, 1, 15, 5],
	[15, 16, 17, 4, 2, 17, 3, 22, 21, 13, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[20, 21, 22, 0, 1, 17, 6, 16, 20, 5, 6, 17, 5, 16, 4, 15, 3, 14, 2, 13], 
	[4, 6, 16, 11, 20, 3, 0, 1, 15, 11, 0, 20, 2, 21, 4, 22, 6, 10, 5, 11],
	[4, 6, 14, 13, 20, 3, 12, 1, 6, 5, 10, 12, 14, 16, 11, 13, 15, 17, 20, 1],
	[4, 6, 16, 11, 21, 3, 0, 1, 22, 5, 6, 4, 2, 0, 1, 3, 5, 20, 22, 13],
	[4, 12, 16, 11, 20, 3, 0, 1, 6, 5, 17, 16, 20, 15, 14, 21, 13, 12, 22, 2],
	[0, 1, 2, 3, 4, 11, 17, 6, 12, 3, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[5, 6, 1, 0, 3, 20, 0, 16, 21, 4, 10, 11, 12, 13, 14, 2, 15, 12, 5, 1],
	[10, 11, 12, 13, 14, 2, 15, 12, 5, 1, 4, 6, 16, 11, 20, 3, 0, 1, 15, 5],
	[15, 16, 17, 4, 2, 17, 3, 22, 21, 13, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[20, 21, 22, 0, 1, 17, 6, 16, 20, 5, 6, 17, 5, 16, 4, 15, 3, 14, 2, 13], 
	[4, 6, 16, 11, 20, 3, 0, 1, 15, 5, 0, 20, 2, 21, 4, 22, 6, 10, 5, 11],
	[4, 6, 14, 13, 20, 3, 12, 1, 6, 5, 10, 12, 14, 16, 11, 13, 15, 17, 20, 1],
	[4, 6, 16, 11, 21, 3, 0, 1, 22, 11, 6, 4, 2, 0, 1, 3, 5, 20, 22, 13],
	[4, 12, 16, 11, 20, 3, 0, 1, 6, 5, 17, 16, 20, 15, 14, 21, 13, 12, 22, 2],
	[0, 1, 2, 3, 4, 11, 17, 6, 12, 3, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[5, 6, 1, 0, 3, 20, 0, 16, 21, 4, 10, 11, 12, 13, 14, 2, 15, 12, 5, 1],
	[10, 11, 12, 13, 14, 2, 15, 12, 5, 1, 4, 6, 16, 11, 20, 3, 0, 1, 15, 5],
	[15, 16, 17, 4, 2, 17, 3, 22, 21, 13, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[20, 21, 22, 0, 1, 17, 6, 16, 20, 5, 6, 17, 5, 16, 4, 15, 3, 14, 2, 13], 
	[4, 6, 16, 11, 20, 3, 0, 1, 15, 5, 0, 20, 2, 21, 4, 22, 6, 10, 5, 11],
	[4, 6, 14, 13, 20, 3, 12, 1, 6, 10, 10, 12, 14, 16, 11, 13, 15, 17, 20, 1],
	[4, 6, 16, 11, 21, 3, 0, 1, 22, 3, 6, 4, 2, 0, 1, 3, 5, 20, 22, 13],
	[4, 12, 16, 11, 20, 3, 0, 1, 6, 5, 17, 16, 20, 15, 14, 21, 13, 12, 22, 2],
	[0, 1, 2, 3, 4, 11, 17, 6, 12, 3, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[5, 6, 1, 0, 3, 20, 0, 16, 21, 4, 10, 11, 12, 13, 14, 2, 15, 12, 5, 1],
	[10, 11, 12, 13, 14, 2, 15, 12, 5, 1, 4, 6, 16, 11, 20, 3, 0, 1, 15, 5],
	[15, 16, 17, 4, 2, 17, 3, 22, 21, 13, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[20, 21, 22, 0, 1, 17, 6, 16, 20, 5, 6, 17, 5, 16, 4, 15, 3, 14, 2, 13], 
	[4, 6, 16, 11, 20, 3, 0, 1, 15, 5, 0, 20, 2, 21, 4, 22, 6, 10, 5, 11],
	[4, 6, 16, 13, 20, 3, 12, 1, 6, 2, 10, 12, 14, 16, 11, 13, 15, 17, 20, 1],
	[4, 6, 16, 11, 21, 3, 0, 1, 22, 5, 6, 4, 2, 0, 1, 3, 5, 20, 22, 13],
	[4, 12, 16, 11, 20, 3, 0, 1, 6, 16, 17, 16, 20, 15, 14, 21, 13, 12, 22, 2],
	[10, 11, 12, 13, 14, 2, 15, 12, 5, 1, 4, 6, 16, 11, 20, 3, 0, 1, 15, 5],
	[0, 1, 2, 3, 4, 11, 17, 6, 12, 3, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[15, 16, 17, 4, 2, 17, 3, 22, 21, 13, 20, 21, 22, 0, 1, 17, 6, 16, 20, 5],
	[4, 6, 16, 11, 20, 3, 0, 1, 15, 5, 0, 20, 2, 21, 4, 22, 6, 10, 5, 11],
];

var movingForward = false, movingBack = false, turningLeft = false, turningRight = false;

// -----------------------------------------------------------------------------
//
// Netcode
// -----------------------------------------------------------------------------

socket = io.connect('http://localhost');

socket.on('autologin', function(data) {
	socket.emit('login', data.name, data.pass);
});


socket.on('newState', function(data) {
	for (var i = 0; i < data.length; ++i)
		addObject(data[i]); 
});


socket.on('addObject', function(data) {
	addObject(data); 
	
});


socket.on('removeObject', function(id) {
	delete objects[id];
});


socket.on('stateUpdate', function(updates) {
	for (var i = 0; i < updates.length; i++)
		objects[updates[i].id][updates[i].property] = updates[i].value;
});


socket.on('global_message', function(data) {
	messages.push(data);
});


socket.on('personal_message', function(data) {
	messages.push(data);
});


socket.on('myPlayerData', function(data) {
	myPlayer = data;
});

// -----------------------------------------------------------------------------
//
// State
// -----------------------------------------------------------------------------


var addObject = function(obj)
{
	if (obj.type == 'player')
		objects[obj.id] = new Player(obj);
	else if (obj.type == 'projectile')
		objects[obj.id] = new Projectile(obj);
}


// -----------------------------------------------------------------------------
//
// Initialization, main loop, and game (re)start
// -----------------------------------------------------------------------------

// initialization
$(document).ready(function()
{
	loadImage("player", "img/test.png");
	loadImage("projectile", "img/fireball.png");
	loadImage("tileset", "img/tileset.png");

	canvas = document.getElementById('c');
	ctx = canvas.getContext('2d');
	$(canvas).click(onClick);
	$(document).keydown(onKeyDown);
	$(document).keyup(onKeyUp);

	$('#login').click(onLogin);
	$('#send').click(onSend);

	lastTimestamp = Date.now();

	startGame();

	gameLoop();
});


// main loop
var gameLoop = function()
{
	// update the time delta for this frame
	dt = (Date.now() - lastTimestamp) / 1000;
	lastTimestamp = Date.now();

	draw();

	// call this function again when the next frame is ready
	requestAnimFrame(gameLoop);
}


var startGame = function()
{
}



// -----------------------------------------------------------------------------
//
// Player
// -----------------------------------------------------------------------------

// a player in the game
function Player(data)
{
	this.id = data.id;
	this.name = data.name;
	this.x = data.x;
	this.y = data.y;
	this.color = data.color;
	this.hp = data.hp;
	this.heading = data.heading;
}

// draws the player
Player.prototype.draw = function()
{
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.heading);
	ctx.drawImage(images["player"], -15, -15);
	ctx.restore();

	ctx.fillStyle = this.color;
	ctx.font = "12px verdana bold";
	ctx.fillText(this.name, this.x - ctx.measureText(this.name).width / 2, this.y - 20);
}

// a projectile
function Projectile(data)
{
	this.id = data.id;
	this.x = data.x;
	this.y = data.y;
	this.heading = data.heading;
	this.damage = data.damage;
	this.speed = data.speed;
}

Projectile.prototype.draw = function()
{
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.heading);
	ctx.drawImage(images["projectile"], -12, -12);
	ctx.restore();
}


// -----------------------------------------------------------------------------
//
// Click handling
// -----------------------------------------------------------------------------


// called when the canvas is clicked
var onClick = function(e)
{
}

// key handling
var onKeyDown = function(e)
{
	socket.emit('keyDown', e.keyCode);
}

// key handling
var onKeyUp = function(e)
{
	socket.emit('keyUp', e.keyCode);
}




// when the login button is clicked, send user info to server for validation
var onLogin = function(e)
{
	socket.emit('login', $('#username').val(), $('#password').val());
	$('#username').val("");
	$('#password').val("");
}

// send message
var onSend = function(e)
{
	socket.emit('message', $('#message').val());
	$('#message').val("");
}

// -------------------------------------------------------------------
//
// AI
// -------------------------------------------------------------------

var makeAIMove = function()
{
}


// -------------------------------------------------------------------
//
// Draw functions
// -------------------------------------------------------------------


var draw = function()
{
	// clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);


	if (myPlayer != '' && objects[myPlayer])
	{
		// draw the world
		// set up the context to draw from the player's perspective
		ctx.save();
		ctx.translate(400, 300);
		ctx.rotate(-Math.PI/2.0);
		ctx.rotate(-objects[myPlayer].heading);
		ctx.translate(-objects[myPlayer].x, -objects[myPlayer].y);
		
		drawMap();

		for (var key in objects)
			objects[key].draw();

		ctx.restore();


		// draw the ui
		ctx.fillStyle = 'rgba(10, 10, 53, 1)';
		// player name, hp, pos
		ctx.fillText(objects[myPlayer].name, 15, 32);
		ctx.fillText(objects[myPlayer].hp + "hp", 15, 55);
		ctx.fillText("(" + Math.floor(objects[myPlayer].x) + ", " + Math.floor(objects[myPlayer].y) + ")", 15, 78);
		drawMessages();
		drawPlayerList();
	}

	// draw title text
	ctx.fillStyle = 'rgba(10, 10, 53, 1)';
	ctx.font = "22px tahoma bold";
	ctx.fillText('KiLlEr bAllEr CoMBo aSS', (canvas.width - ctx.measureText('KiLlEr bAllEr CoMBo aSS').width) / 2, 32);
}

var drawMessages = function()
{
	var x = 10, y = canvas.height - 10, dy = 15;
	ctx.font = "12px verdana bold";
	for (var i = 0; i < Math.min(5, messages.length); ++i)
	{
		m = messages[messages.length - 1 - i];
		if (m.sender)
		{
			ctx.fillStyle = 'rgba(40, 40, 40, 1)';
			if (objects[m.sender])
				ctx.fillStyle = objects[m.sender].color;
			ctx.fillText(m.sender, x, y - dy * i);
			ctx.fillText(m.text, x + ctx.measureText(m.sender).width, y - dy * i);
		}
		else
		{
			ctx.fillStyle = 'rgba(40, 40, 40, 1)';
			ctx.fillText(m.text, x, y - dy * i);
		}
	}
}


var drawPlayerList = function()
{
	var x = canvas.width - 100, y = canvas.height - 100, dy = 15;
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.font = "12px verdana bold";
	ctx.fillText("players:", x, y - dy - 3);
	var count = 0;
	for (var key in objects)
		if (objects[key] instanceof Player)
			ctx.fillText(objects[key].name, x, y + dy * count++);
}

var drawMap = function()
{	
	for (var y = 0; y < worldmap.length; ++y)
		for (var x = 0; x < worldmap[0].length; x++)
		{
			// ts = tile size
			var ts = 64;
			// ss = screen size
			var ss = ts * 2;
			var u = (worldmap[y][x] % 10) * ts;
			var v = Math.floor(worldmap[y][x] / 10) * ts;
			var xoff = -worldmap[0].length * ss / 2;
			var yoff = -worldmap.length * ss / 8;

			ctx.drawImage(images["tileset"], u, v, ts, ts, x * ss + ss/2 * ((y % 2) * -1) + xoff, y * (ss/4 - 1) + yoff, ss, ss);
		}
}


// -------------------------------------------------------------------
//
// images
// -------------------------------------------------------------------

var loadImage = function (name, src)
{
	images[name] = new Image();
	$(images[name]).error(function() { console.log("Error: " + images[name].src + " not loaded."); });
	images[name].src = src;
}


// -------------------------------------------------------------------
//
// Misc utility functions
// -------------------------------------------------------------------


// gets the mouse coordinates relative to the canvas in all situations
var getMouseCoords = function(e)
{
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = e.pageX - totalOffsetX;
    canvasY = e.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}


// 'polyfill' to handle cross-browser support for requesting a new frame
window.requestAnimFrame = (function()
{
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();