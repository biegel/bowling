# Javascript bowling simulator
Bowling javascript simulator, with the following features:
* multi-lingual support
* multi-player support
* strike/spare simulator (knocks down all the pins that are standing)
* normal throw simulator (knocks down a random number of pins)
* animation for pin strikes -- simulates which pins are likely to be knocked down.  For example, it's physically impossible to knock down the middle pin (index 4) without knocking down the front pin.  The simulator includes sets of pin combinations a player is likely to see in real life (see ```pinPatterns``` in ```js/Renderer.js```).
* winner's screen, which lists the winner (or winners, if there is a tie match) and the point total
* user is given option to play again, choose new players, or leave the game at the end of the match

This program contains the following javascript files:
* ```js/lib.js``` -- extends core javascript classes with some useful functional methods
* ```js/Bowl.js``` -- the main class for the bowling game
* ```js/Frame.js``` -- class representing a frame
* ```js/Player.js``` -- simple class representing a single player
* ```js/Renderer.js``` -- renderer class which controls the DOM and animations

All javascript is native, no external libraries used.
