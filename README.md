tanks
=====

- todo

 - improve ui elements
 - add more abilities
 - move code into separate files
 - player stats and stuff
 - add jumping
 - move some stuff (map, animations) to server side
 - double tap movement keys to dodge/sprint
 - get it hosted
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