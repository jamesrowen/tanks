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

var myPlayer = { name:'test', hp:0 };

var playerImg = new Image();
$(playerImg).error(function() { console.log("Error: " + playerImg.src + " not loaded."); });
playerImg.src = "img/test.png";
var projImg = new Image();
$(projImg).error(function() { console.log("Error: " + projImg.src + " not loaded."); });
projImg.src = "img/fireball.png";

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
	ctx.translate(this.x - objects[myPlayer].x + 400, this.y - objects[myPlayer] + 300);
	ctx.rotate(this.heading);
	ctx.drawImage(playerImg, -15, -15);
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
	ctx.translate(this.x + 12, this.y + 12);
	ctx.rotate(this.heading);
	ctx.drawImage(projImg, -12, -12);
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

	for (var key in objects)
		objects[key].draw();

	// draw text
	ctx.fillStyle = 'rgba(0, 0, 63, 1)';
	ctx.font = "22px tahoma bold";
	ctx.fillText('Networking test', (canvas.width - ctx.measureText('Networking test').width) / 2, 32);
	ctx.fillText(myPlayer.name, 15, 32);
	ctx.fillText(myPlayer.hp + "hp", 15, 55);
	drawMessages();
	drawPlayerList();
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
