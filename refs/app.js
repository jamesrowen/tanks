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

stateUpdate = [];

usernames = ['james', 'jocelyn', 'dickbutt'];
usercount = 0;

io.sockets.on('connection', function (socket) {

  // for testing purposes, give the connection a username from a list for auto-login
  socket.emit('autologin', { name: usernames[usercount++], pass:'asdf' });


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
		var c = 'rgba(' + Math.floor(Math.random() * 190 + 25) + ',' + Math.floor(Math.random() * 190 + 25) + ',' + Math.floor(Math.random() * 190 + 25) + ', 1)'

		var p = new S_Player(username, username, c);
		playerDB[username] = p;
		passwordDB[username] = password;
		
		socket.username = username;
		socket.join('loggedin');

		socket.emit('myPlayerData', p.getData());
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

		socket.emit('myPlayerData', playerDB[username].getData());
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

		usercount--;
	}
  });

});



var createProjectile = function(player)
{
	console.log("cd: " + player.cooldown);
	if (player.cooldown == 0)
	{
		console.log("creating proj");
		objects['proj' + idCount] = new S_Projectile('proj' + idCount, player.x + Math.cos(player.heading) * 30, player.y + Math.sin(player.heading) * 30, player.heading);
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

	this.x = 400;
	this.y = 300;
	this.hp = 100;
	this.heading = -Math.PI / 2;
	this.cooldown = 0;
}

S_Player.prototype.update = function()
{
	direc = 0;
	if (this.movingForward)
		direc += 1;
	if (this.movingBack)
		direc -= 1;
	if (this.turningLeft)
		this.heading -= .03;
	if (this.turningRight)
		this.heading += .03;

	this.x += direc * Math.cos(this.heading) * 3;
	this.y += direc * Math.sin(this.heading) * 3;

	if (this.cooldown > 0)
		this.cooldown = Math.max(0, this.cooldown - 1000 / 60);

	if (direc != 0 || this.turningLeft || this.turningRight)
	{
		stateUpdates.push({ id: this.id, property: 'x', value: this.x });
		stateUpdates.push({ id: this.id, property: 'y', value: this.y });
		stateUpdates.push({ id: this.id, property: 'heading', value: this.heading });
	}

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
	this.speed = 7;
}

S_Projectile.prototype.update = function()
{
	this.x += Math.cos(this.heading) * this.speed;
	this.y += Math.sin(this.heading) * this.speed;

	if (this.x < 5 || this.y < 5 || this.x > 795 || this.y > 595)
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
