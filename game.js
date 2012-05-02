// -----------------------------------------------------------------------------
// game.js
// 
//
// Author: James Rowen - jamesrowen@gmail.com
// Date: 4/30/12
// -----------------------------------------------------------------------------


gameState = 0;		// simple game state management. 0 = player turn, 1 = AI turn, 2 = game over

dt = 0;			// timing snapshot
lastTimestamp = 0;


messages = [];

objects = [];
var myPlayer = '';

images = [];

uielements = [];
focusElementID = '';

worldmap = [
	[40, 41, 42, 22, 22, 14, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
	[48, 49, 50, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 15, 22, 22],
	[56, 57, 58, 15, 22,  6, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 14, 22, 22, 22, 22, 22, 22, 22, 22, 14, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,  6, 22, 22, 22, 22],
	[22,  6, 22, 14, 14, 22, 22, 22,  6, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 14, 14, 22, 22, 22, 22,  6, 22, 22,  6, 22, 22, 22, 22,  6, 22, 22],
	[22, 22, 14, 22, 22, 22,  6, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22,  0,  1,  1,  1,  2, 22, 22, 22, 22, 22, 14],
	[22, 15, 14,  6, 22, 22, 22, 15, 22,  8,  9,  9,  9, 10, 22, 22, 22,  6, 22, 14],
	[ 6, 22, 22, 22, 22, 22, 22, 22, 22,  8,  9,  9,  9, 10, 14, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 14, 22, 22,  6,  8,  9,  9,  9, 10, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 16, 17, 17, 17, 18, 22,  6, 22, 14, 22, 22],
	[22, 22, 22, 22,  6, 22,  6, 22, 22, 22, 22, 22,  6, 22, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 14, 22, 22, 22, 22, 22, 22],
	[14, 14, 14,  6, 22, 22, 22, 22, 22, 22, 22,  6, 22, 22, 22, 22, 22, 22,  6, 22],
	[22, 14, 22, 22, 22, 22, 22, 22, 22,  6, 22, 22, 22, 15,  6, 22, 14, 22, 22, 22],
	[22, 22, 22, 22, 22,  6, 22, 22,  6, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 15, 22, 22],
	[22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 14]
];

var movingForward = false, movingBack = false, turningLeft = false, turningRight = false;

// -----------------------------------------------------------------------------
//
// Netcode
// -----------------------------------------------------------------------------

socket = io.connect('http://localhost');


socket.on('newState', function(data) {
	for (var i = 0; i < data.length; ++i)
		addObject(data[i]); 
});


socket.on('addObject', function(data) {
	addObject(data); 

	// when we receive the player's own data, we are ready to move to the game world
	if (data.id == myPlayer)
	{
		gameState = 1;
		uielements = [];
		focusElementID = '';
	}
	
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
	loadImage("welcome", "img/welcome.png");
	loadImage("player", "img/test.png");
	loadImage("projectile", "img/fireball.png");
	loadImage("tileset", "img/tileset.png");
	loadImage("login", "img/login.png");
	loadImage("register", "img/register.png");

	uielements["user"] = new UITextbox("user", "user", 355, 296);
	uielements["pass"] = new UITextbox("pass", "pass", 355, 323);
	uielements["login"] = new UIButton("login", "login", 313, 360, function() {
		socket.emit('login', uielements["user"].text, uielements["pass"].text);
	});
	// TODO: separate login and register functionality
	uielements["register"] = new UIButton("register", "register", 407, 360, function() {
		socket.emit('login', uielements["user"].text, uielements["pass"].text);
	});
		

	canvas = document.getElementById('c');
	ctx = canvas.getContext('2d');
	$(canvas).click(onClick);
	$(document).keydown(onKeyDown);
	$(document).keyup(onKeyUp);

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
// UI
// -----------------------------------------------------------------------------

function UITextbox(id, label, x, y)
{
	this.id = id;
	this.label = label;
	this.x = x;
	this.y = y;
	this.w = 120;
	this.h = 18;
	this.text = '';
}

UITextbox.prototype.draw = function()
{
	ctx.font = "12px verdana bold";
	ctx.fillText(this.label + ':  ' + this.text, this.x - ctx.measureText(this.label + ': ').width, this.y + 13);
	ctx.strokeRect(this.x, this.y, this.w, this.h);
}

UITextbox.prototype.onClick = function()
{
	focusElementID = this.id;
}

function UIButton(id, texture, x, y, onClick)
{
	this.id = id;
	this.texture = texture;
	this.x = x;
	this.y = y;
	this.w = 80;
	this.h = 40;
	this.text = '';
	this.onClick = onClick;
}

UIButton.prototype.draw = function()
{
	ctx.drawImage(images[this.texture], this.x, this.y);
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

	sx = (this.x - objects[myPlayer].x) * Math.cos(-objects[myPlayer].heading) - (this.y - objects[myPlayer].y) * Math.sin(-objects[myPlayer].heading);
	sy = (this.x - objects[myPlayer].x) * Math.sin(-objects[myPlayer].heading) + (this.y - objects[myPlayer].y) * Math.cos(-objects[myPlayer].heading);

	ctx.save();
	ctx.fillStyle = this.color;
	ctx.font = "12px verdana bold";
	ctx.translate(this.x, this.y);
	ctx.rotate(objects[myPlayer].heading + Math.PI / 2);
	ctx.fillText(this.name, - ctx.measureText(this.name).width / 2, - 20);
	ctx.restore();
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
// mouse input
// -----------------------------------------------------------------------------


// called when the canvas is clicked
var onClick = function(e)
{
	var mouse = getMouseCoords(e);
	var uiGetsFocus = false;

	for (var key in uielements)
	{
		if (mouse.x > uielements[key].x && mouse.y > uielements[key].y && mouse.x < uielements[key].x + uielements[key].w && mouse.y < uielements[key].y + uielements[key].h)
		{
			uielements[key].onClick();
			uiGetsFocus = true;
		}
	}

	if (!uiGetsFocus)
		focusElementID = '';
}


// -----------------------------------------------------------------------------
//
// key input
// -----------------------------------------------------------------------------



// key handling
var onKeyDown = function(e)
{
	if (focusElementID != '')
	{
		// backspace
		if (e.keyCode == 8)
			uielements[focusElementID].text = uielements[focusElementID].text.substring(0, uielements[focusElementID].text.length - 1);
		// tab - TODO: implement UI element tab-ordering
		//else if (e.keyCode == 9)
			
		// enter - removes focus from the element
		else if (e.keyCode == 13)
		{
			focusElementID = '';
		}			
		else
			uielements[focusElementID].text += String.fromCharCode(e.keyCode);
	}
	else
		socket.emit('keyDown', e.keyCode);
}

// key handling
var onKeyUp = function(e)
{
	if (focusElementID == '')
		socket.emit('keyUp', e.keyCode);
}

// send message
var onSend = function(e)
{
	socket.emit('message', $('#message').val());
	$('#message').val("");
}


// -------------------------------------------------------------------
//
// Draw functions
// -------------------------------------------------------------------


var draw = function()
{
	// clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// welcome/login screen
	if (gameState == 0)
	{
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.drawImage(images["welcome"], -images["welcome"].width / 2, -images["welcome"].height / 2);
		ctx.restore();
	}
	// logged in
	else if (gameState == 1)
	{
		// draw the world
		// set up the context to draw from the player's perspective
		ctx.save();
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(-Math.PI/2.0);
		ctx.rotate(-objects[myPlayer].heading);
		ctx.translate(-objects[myPlayer].x, -objects[myPlayer].y);
		
		drawMap();

		for (var key in objects)
			objects[key].draw();

		ctx.restore();


		// TODO: add these things as ui elements
		ctx.fillStyle = 'rgba(10, 10, 53, 1)';
		// player name, hp, pos
		ctx.fillText(objects[myPlayer].name, 15, 32);
		ctx.fillText(objects[myPlayer].hp + "hp", 15, 55);
		ctx.fillText("(" + Math.floor(objects[myPlayer].x) + ", " + Math.floor(objects[myPlayer].y) + ")", 15, 78);

		drawPlayerList();
	}

	for (var key in uielements)
		uielements[key].draw();

	drawMessages();

	// draw title text
	ctx.fillStyle = 'rgba(10, 10, 53, 1)';
	ctx.font = "22px tahoma bold";
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
			var ts = 32;
			// ss = screen size
			var ss = ts * 2;
			var u = (worldmap[y][x] % 8) * (ts + 1);
			var v = Math.floor(worldmap[y][x] / 8) * (ts + 1);
			var dx = x * ss - worldmap[0].length * ss / 2;
			var dy = y * ss - worldmap.length * ss / 2;

			ctx.drawImage(images["tileset"], u, v, ts, ts, dx, dy, ss, ss);
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