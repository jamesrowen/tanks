var Action = function(player, name)
{
	this.player = player;
	this.name = name;
}

Action.prototype.start = function()
{
	player.speed = 660;
	
}

Action.prototype.update = function()
{
}

Action.prototype.end = function()
{
}

exports.Action = Action;

//new Action('dodgeBack', function() { this.player.speed = 660; }, this.player.speed