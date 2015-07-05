// The main game class
function Bowl(div) {
  var _this = this;
  this.maxPlayers = 6;
  this.currentFrame = null;
  this.currentRoll = null;
  this.currentPlayer = null;
  this.currentPins = null;
  this.highlighter = null;
  this.renderer = new Renderer(this, div);

  this.state = Bowl.WELCOME_SCREEN;
  this.renderer.renderState();
};
Bowl.prototype.startNewGame = function() {
  delete this.player;
  this.player = [];

  this.state = Bowl.PLAYER_SELECT;
  this.renderer.renderState();
};
Bowl.prototype.setPlayers = function() {
  var _this = this;
  // Get the players from the form
  var position = 0;
  for ( var i = 0; i < this.maxPlayers; i++ ) {
    var name = document.getElementById('player_' + i).value.toString().trim();
    if ( name !== "" ) {
      this.player[position] = new Player(name);
      position++;
    }
  }
  if ( this.player.length === 0 ) {
    this.renderer.playerCountError();
    return;
  }
  this.beginGame();
};
Bowl.prototype.beginGame = function() {
  for ( var i = 0; i < this.player.length; i++ ) {
    this.player[i].reset();
  }
  this.currentFrame = 0;
  this.currentRoll = 0;
  this.currentPlayer = 0;
  this.currentPins = 10;
  this.currentPinStrike = null;
  this.state = Bowl.GAME_ACTIVE;
  this.renderer.renderState();
  this.renderer.startTurn();
};
Bowl.prototype.determinePins = function(type) {
  // Hit a random number of pins
  var pins = Math.floor(Math.random() * (this.currentPins + 1));
  // Unless we're throwing a strike/spare, then override the random number
  if ( type === Frame.SPARE || type === Frame.STRIKE ) {
    pins = this.currentPins;
  }
  this.currentPinStrike = pins;
  return true;
};
Bowl.prototype.pinStrike = function() {
  this.currentPins -= this.currentPinStrike;
  this.recordScore(this.currentPinStrike);
  this.renderer.nextThrow();
  if ( this.currentFrame === 9 ) {
    // If this is the last frame, they get extra rolls in certain cases
    if ( this.currentRoll === 0 ) {
      if ( this.currentPinStrike === 10 ) {
        this.currentPins = 10;
        this.renderer.resetPins();
      }
      this.currentRoll++;
    } else if ( this.currentRoll === 1 ) {
      if ( this.getCurrentFrame().frameStatus === Frame.STRIKE_EXTRA ) {
        if ( this.currentPinStrike === 10 ) {
          this.currentPins = 10;
          this.renderer.resetPins();
        }
        this.currentRoll++;
      } else {
        if ( this.currentPins === 0 ) {
          this.currentPins = 10;
          this.renderer.resetPins();
          this.currentRoll++;
        } else {
          this.nextPlayer();
        }
      }
    } else {
      this.nextPlayer();
    }
  } else {
    if ( this.currentPinStrike === 10 || this.currentRoll === 1 ) {
      this.nextPlayer();
    } else {
      this.currentRoll++;
    } 
  }
};
Bowl.prototype.nextPlayer = function() {
  this.renderer.finishTurn();
  this.currentPlayer++;
  this.currentRoll = 0;
  this.currentPins = 10;
  this.currentPinStrike = null;
  if ( this.currentPlayer === this.player.length ) {
    this.currentPlayer = 0;
    this.currentFrame++;
  }
  if ( this.currentFrame === 10 ) {
    this.state = Bowl.GAME_OVER;
    this.renderer.renderState();
  } else {
    this.renderer.nextPlayer();
  }
};
Bowl.prototype.getCurrentPlayer = function() {
  return this.player[this.currentPlayer];
};
Bowl.prototype.getCurrentFrame = function() {
  return this.getCurrentPlayer().frameSet[this.currentFrame];
};
Bowl.prototype.recordScore = function(pins) {
  this.getCurrentPlayer().markScore(this.currentFrame, this.currentRoll, pins);
  this.renderer.recordScore(pins);
  this.tallyTotalScore();
};
Bowl.prototype.tallyTotalScore = function() {
  var score = 0, totalScore = 0, scoreBox = undefined, i = 0, prevScore = null;

  // We start at the current frame and go backwards to calculate the score for each
  // frame.  This will catch any frames that were previously null; if so, maybe
  // we can caulcuate the score now based on the new data from the current frame.
  for ( i = this.currentFrame; i >= 0; i-- ) {
    this.getCurrentPlayer().frameSet[i].calculateScore();
  }
  // Then, start at the beginning and tally the total score
  for ( i = 0; i < 10; i++ ) {
    score = this.getCurrentPlayer().frameSet[i].score;
    scoreBox = document.getElementById('score_' + this.currentPlayer + '_' + i);
    if ( score !== null ) {
      totalScore += score;
      scoreBox.innerHTML = totalScore;
      this.getCurrentPlayer().totalScore = totalScore;
    }
  }
};

// Game states
Bowl.WELCOME_SCREEN = 1;
Bowl.PLAYER_SELECT = 2;
Bowl.GAME_START = 3;
Bowl.GAME_ACTIVE = 4;
Bowl.GAME_OVER = 5;
