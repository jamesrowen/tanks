
// the Input object parses raw input sent by the players into useful data.
// each player has their own Input object.
var Input = function(player)
{	
	this.player = player;
	this.keys = [];			// list of currently pressed keys
	this.times = [];		// timers for each key press
	this.taps = [];			// keys that have been "tapped" recently
	this.tapTimes = [];		// timers for recent taps
	
	this.tapTime = 130;			// max length of a key press to be considered a "tap", in ms
	this.tapDecayTime = 180;	// the time a tap lasts in the list, in ms

	// maps key codes (received from browser) to the string labels we will use
	this.keyLabels = {
		8: 'backspace',
		9: 'tab',
		13: 'enter',
		32: 'space',
		65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j',
		75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't',
		85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z'
	};
}

// checks for decay of tapped keys
Input.prototype.update = function()
{
	for (var i = 0; i < this.taps.length; ++i)
		if (Date.now() - this.tapTimes[i] > this.tapDecayTime)
		{
			this.taps.splice(i, 1);
			this.tapTimes.splice(i, 1);
			--i;
		}
}

// key press - if the key wasn't already pressed, add to the list.
// only tracks keys that have been given a label.
Input.prototype.keyDown = function(key)
{
	if (this.keyLabels[key] && this.keys.indexOf(this.keyLabels[key]) == -1)
	{
		this.keys.push(this.keyLabels[key]);
		this.times.push(Date.now());
	
		this.player.keyDown(this.keyLabels[key]);
	}
}

// key release - check for a "tap" and remove from the list
Input.prototype.keyUp = function(key)
{
	if (this.keyLabels[key] && this.keys.indexOf(this.keyLabels[key]) != -1)
	{
		index = this.keys.indexOf(this.keyLabels[key]);
		
		// check if the duration of this press was short enough to be a tap
		if (Date.now() - this.times[index] <= this.tapTime)
		{
			tapIndex = this.taps.indexOf(this.keyLabels[key]);
			
			// key already has a recent tap - activate double tap
			if (tapIndex != -1)
			{
				this.player.keyDoubleTap(this.keyLabels[key]);
				
				// remove taps from list
				this.taps.splice(tapIndex, 1);
				this.tapTimes.splice(tapIndex, 1);
			}
			// no recent tap - add key to list
			else
			{
				this.taps.push(this.keyLabels[key]);
				this.tapTimes.push(Date.now());
			}
		}
		
		this.player.keyUp(this.keyLabels[key]);
		
		// remove the key from the active list
		this.keys.splice(index, 1);
		this.times.splice(index, 1);
	}
}


// export this object
exports.Input = Input;