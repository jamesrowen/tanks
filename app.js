// initialize http server and socket.io
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app), 
    fs = require('fs'),
    url = require('url');

app.listen(8080);


// serves up files
function handler (req, res) { 

	// serve homepage
	if (req.url == '/')
	{
		var callback = function (err, data)
		{
			if (err) 
			{
				res.writeHead(500);
				return res.end('Error loading newgame.html');
			}
			res.writeHead(200);
			res.end(data);
		}

		fs.readFile(__dirname + '/newgame.html', callback);
	}
	// serve png
	else if (req.url[req.url.length - 2] == 'n' && req.url[req.url.length - 1] == 'g')
	{
		var img = fs.readFileSync(__dirname + req.url);
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.end(img, 'binary');
	}
	// serve js
	else if (req.url[req.url.length - 2] == 'j' && req.url[req.url.length - 1] == 's')
	{
		var js = fs.readFileSync(__dirname + req.url);
		res.writeHead(200, {'Content-Type': 'text/javascript' });
		res.end(js);
	}
}


// database of all players
playerDB = [];
passwordDB = [];

// objects currently in the game world
objects = [];
idCount = 1;
animations = [];

stateUpdate = [];

io.sockets.on('connection', function (socket) {

  socket.on('login', function(username, password)
  {
	// if connection already has a username, dont log in
	if (socket.username)
	{
		socket.emit('personal_message', {sender:-1, text:"You are already logged in."});
	}

	// if user is not in the database, create a new account
	else if (username != "" && password != "" && !playerDB[username])
	{
		var c = 'rgba(' + Math.floor(Math.random() * 60 + 190) + ',' + Math.floor(Math.random() * 60 + 190) + ',' + Math.floor(Math.random() * 60 + 190) + ', 1)'

		var p = new S_Player(username, username, c);
		playerDB[username] = p;
		passwordDB[username] = password;
		
		socket.username = username;
		socket.join('loggedin');

		socket.emit('myPlayerData', p.id);
		var objData = [];
		for (var key in objects)
			if (objects.hasOwnProperty(key))
				objData.push(objects[key].getData());
		socket.emit('newState', objData);

		objects[username] = p;

		io.sockets.in('loggedin').emit('addObject', p.getData());
		io.sockets.in('loggedin').emit('global_message', {sender:username, text:" has created an account."});
	}

	// otherwise check password
	else if (passwordDB[username] == password)
	{
		socket.username = username;
		socket.join('loggedin');

		socket.emit('myPlayerData', playerDB[username].id);
		var objData = [];
		for (var key in objects)
			if (objects.hasOwnProperty(key))
				objData.push(objects[key].getData());
		socket.emit('newState', objData);

		objects[username] = playerDB[username];

		io.sockets.in('loggedin').emit('addObject', playerDB[username].getData());
		io.sockets.in('loggedin').emit('global_message', {sender:username, text:" has connected."});
	}
	else
		socket.emit('personal_message', { text:"Incorrect password" });
	
  });


  socket.on('keyDown', function(key) 
  {
	if (socket.username)
	{
		// w - forward
		if (key == 87)
			objects[socket.username].movingForward = true;

		// a - turn left
		else if (key == 65)
			objects[socket.username].turningLeft = true;

		// s - back
		else if (key == 83)
			objects[socket.username].movingBack = true;

		// d - turn right
		else if (key == 68)
			objects[socket.username].turningRight = true;

		// q - strafe left
		if (key == 81)
			objects[socket.username].strafeLeft = true;

		// e - strafe right
		else if (key == 69)
			objects[socket.username].strafeRight = true;	

		// space - shoot fireball
		else if (key == 32)
			createProjectile(objects[socket.username]);
	}
	
  });


  socket.on('keyUp', function(key)
  {
	if (socket.username)
	{
		// w - forward
		if (key == 87)
			objects[socket.username].movingForward = false;

		// a - turn left
		else if (key == 65)
			objects[socket.username].turningLeft = false;

		// s - back
		else if (key == 83)
			objects[socket.username].movingBack = false;

		// d - turn right
		else if (key == 68)
			objects[socket.username].turningRight = false;

		// q - strafe left
		if (key == 81)
			objects[socket.username].strafeLeft = false;

		// e - strafe right
		else if (key == 69)
			objects[socket.username].strafeRight = false;
	}
  });


  socket.on('message', function(message)
  {
	if (socket.username && message != "")
		io.sockets.in('loggedin').emit('global_message', {sender: socket.username, text:": " + message});
  });

  socket.on('disconnect', function()
  {
	if (socket.username)
	{
		playerDB[socket.username] = objects[socket.username];
		io.sockets.in('loggedin').emit('removeObject', socket.username);
		io.sockets.in('loggedin').emit('global_message', {sender:socket.username, text:" has disconnected."});
		delete objects[socket.username];

	}
  });

});



var createProjectile = function(player)
{
	console.log("cd: " + player.cooldown);
	if (player.cooldown == 0)
	{
		console.log("creating proj");
		objects['proj' + idCount] = new S_Projectile('proj' + idCount, player.x + Math.cos(player.heading - Math.PI/2) * 30, player.y + Math.sin(player.heading - Math.PI/2) * 30, player.heading);
		io.sockets.emit('addObject', objects['proj' + idCount].getData());
		++idCount;
		player.cooldown == 1000;
	}
}

// -----------------------------------------------------------------------------
//
// Player
// -----------------------------------------------------------------------------

// a player in the game
function S_Player(id, name, color)
{
	this.id = id;
	this.name = name;
	this.color = color;

	this.x = 0;
	this.y = 0;
	this.hp = 100;
	this.heading = 0;
	this.cooldown = 0;
}

S_Player.prototype.update = function()
{
	// calculate the direction of movement
	direc = [0, 0];
	if (this.movingForward)
		direc[0] += 1;
	if (this.movingBack)
		direc[0] -= 1;
	if (this.strafeLeft)
		direc[1] -= 1;
	if (this.strafeRight)
		direc[1] += 1;
	if (this.turningLeft)
		this.heading -= .03;
	if (this.turningRight)
		this.heading += .03;

	if (this.heading > Math.PI)
		this.heading -= Math.PI * 2;
	if (this.heading < -Math.PI)
		this.heading += Math.PI * 2;

	// if moving two directions, normalize the movement vector
	if (Math.abs(direc[0]) + Math.abs(direc[1]) > 1)
	{
		direc[0] /= 1.4142;
		direc[1] /= 1.4142;
	}

	var theta = this.heading - Math.PI/2;
	// update position
	this.x += (direc[0] * Math.cos(theta) - direc[1] * Math.sin(theta)) * 3;
	this.y += (direc[0] * Math.sin(theta) + direc[1] * Math.cos(theta)) * 3;

	// crude collision detection with wall, magic numbers for world boundary and player radius
	if (this.x < -640 + 15)
		this.x = -640 + 15;
	if (this.y < -640 + 15)
		this.y = -640 + 15;
	if (this.x > 640 - 15)
		this.x = 640 - 15;
	if (this.y > 640 - 15)
		this.y = 640 - 15;

	// if we've moved, add to the state update
	if (direc[0] != 0 || direc[1] != 0 || (this.turningLeft ^ this.turningRight))
	{
		stateUpdates.push({ id: this.id, property: 'x', value: this.x });
		stateUpdates.push({ id: this.id, property: 'y', value: this.y });
		stateUpdates.push({ id: this.id, property: 'heading', value: this.heading });
	}

	// ability cooldown
	if (this.cooldown > 0)
		this.cooldown = Math.max(0, this.cooldown - 1000.0 / 60.0);


}

S_Player.prototype.getData = function()
{  
	return {
		type: 'player',
		id: this.id,
		name: this.name,
		color: this.color,
		x: this.x,
		y: this.y,
		hp: this.hp,
		heading: this.heading
	};
}

// -----------------------------------------------------------------------------
//
// Projectile
// -----------------------------------------------------------------------------

// a projectile in the game
function S_Projectile(id, x, y, heading)
{
	this.id = id;
	this.x = x;
	this.y = y;
	this.heading = heading;
	this.damage = 10;
	this.speed = 5;
}

S_Projectile.prototype.update = function()
{
	this.x += Math.cos(this.heading - Math.PI/2) * this.speed;
	this.y += Math.sin(this.heading - Math.PI/2) * this.speed;

	// if it leaves the dimensions of the current test map, remove it
	if (this.x < -640 || this.y < -640 || this.x > 640 || this.y > 640)
	{
		delete objects[this.id];
		io.sockets.emit('removeObject', this.id);
		return;
	}

	for (var key in objects)
	{
		if (objects.hasOwnProperty(key) && objects[key] instanceof S_Player &&
			(this.x - objects[key].x) * (this.x - objects[key].x) + (this.y - objects[key].y) * (this.y - objects[key].y) < (12 + 15) * (12 + 15))
		{
			objects[key].hp -= this.damage;
			stateUpdates.push({ id: objects[key].id, property: 'hp', value: objects[key].hp });
			delete objects[this.id];
			io.sockets.emit('removeObject', this.id);
			return;
		}
	}

	stateUpdates.push({ id: this.id, property: 'x', value: this.x });
	stateUpdates.push({ id: this.id, property: 'y', value: this.y });
}

S_Projectile.prototype.getData = function()
{  
	return {
		type: 'projectile',
		id: this.id,
		x: this.x,
		y: this.y,
		heading: this.heading,
		damage: this.damage,
		speed: this.speed
	};
}

// -----------------------------------------------------------------------------
//
// Game Loop
// -----------------------------------------------------------------------------


var gameLoop = function()
{
	stateUpdates = [];

	for (var key in objects)
		objects[key].update();

	if (stateUpdates.length > 0)
		io.sockets.emit('stateUpdate', stateUpdates);

}

setInterval(gameLoop, 1000 / 60);
