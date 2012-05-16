tanks
=====

- todo

 - improve ui elements - player "unit frame", stats

 - add death/respawn/kdr 
 - refine player action system
   - create a class with a set of functions - action.start(), update(), end()
   - use start time instead of timer
   - incorporate walk/idle, animations, etc
 - add jumping
 - add player.keyDownWithTap() func for sprinting?
 - streamline strange input handling path: keyDown callbackfrom browser -> player.input.keyDown() -> player.keyDown()
 
 - move code into separate files
 - add more abilities
 - add acceleration to all movement
 - player stats and stuff
 - improve chat
 - move some stuff (map, animations) to server side
 - set up permanent player db (mongodb)

- ideas

 - team based game
 - defend your base
   - can build it up with fortifications/abilities/bonuses
 - can build things like lookout towers
 - large, open map
 - respawning mob camps to farm
 - resources

- changelog

5/16
 - improved ui slightly
   - added player unit frame
   - text boxes look better
5/15
 - added health bars over players
 - added stamina to players
   - double-tap moves cost stamina
   - regens over time
   - shown under health bar  
5/14
 - action system update in progress
 - added idle animation
 - double tap back to dodge back
 - created server-side input class to handle input for each player
 - accumulated taps decay after a short time
 
5/12
 - double tap strafe keys to dodge (alpha)
 - double tap turn keys to spin 180
 - changed key input , needs more work

5/11
 - got it hosted on nodejitsu - tanks.jit.su
 
5/3
 - made bigger and better map
 - fixed cooldown on shoot ability
 - made fullscreen
 - moved chat into canvas ui, got rid of html form
 - incorporated dt for object updates on server
5/2
 - character/sprite animation
5/1
 - changed tileset to top-down one
 - added game state: login screen -> game world
 - added crude ui - textbox and button
 older
 - fixed name drawing - transform player position by -myPlayer's transform, add offset
 - added strafing
 - added world map created from a tileset (4/30)
 - locked view to player (rotate everything else)
 - store objects by name - get rid of findPlayer
 - streamline srver update to all objects - dif between client/server representation/what to pass? posssible to use inheritance? what is th eoverhead of attached functions?
 - player only sends raw input to server
 - missile/player collisions/damage (also remove missiles out of bounds)
 - spacebar fires missile
 - draw image (show heading)