(function(){
  // Let's augment some native javascript classes with some useful methods
  Element.prototype.addClass = function(newClass) {
    var classes = this.className.split(" "), comp = {}, reduced = [];
    classes.push(newClass);
    for ( var i in classes ) {
      if ( comp[classes[i]] === undefined ) {
        comp[classes[i]] = true;
        reduced.push(classes[i]);
      }
    }
    this.className = reduced.join(" ");
    return this;
  }
  Element.prototype.removeClass = function(oldClass) {
    var classes = this.className.split(" "), reduced = [];
    for ( var i in classes ) {
      if ( classes[i] !== oldClass ) {
        reduced.push(classes[i]);
      }
    }
    this.className = reduced.join(" ");
    return this;
  }
  Element.prototype.containsClass = function(checkClass) {
    var classes = this.className.split(" ");
    for ( var i in classes ) {
      if ( classes[i] === checkClass ) {
        return true;
      }
    }
    return false;
  }
    
  // wrapper for making simple ajax requests
  // create a simple cookie storage and parsing method for saving scores

  // our main classes
  function Player(name) {
    this.name = name;
    this.reset();
  };
  Player.prototype.reset = function() {
    this.frameSet = {};
    for ( var i = 0; i < 10; i++ ) {
      this.frameSet[i] = new Frame(i, this.frameSet);
    }
    this.currentFrame = 0;
    this.totalScore = 0;
  };
  Player.prototype.getScore = function(frame) {
    if ( frame === undefined ) {
      frame = this.currentFrame;
    }
    return this.frameSet[frame].score;
  };
  Player.prototype.markScore = function(frame, roll, pins) {
    this.frameSet[frame].markScore(roll, pins);
    return this.frameSet[frame].score;
  };

  function Frame(position, set) {
    this.position = position;
    this.set = set;
    this.roll = [];
    this.roll[0] = null;
    this.roll[1] = null;
    if ( this.position === 9 ) {
      this.roll[2] = null;
    }
    this.frameStatus = Frame.UNPLAYED;
    this.score = null;
  };
  Frame.prototype.markScore = function(roll, pins) {
    this.roll[roll] = pins;
    if ( this.position === 9 ) {
      if ( roll === 0 ) {
        if ( pins === 10 ) {
          this.frameStatus = Frame.STRIKE_EXTRA;
        } else {
          this.frameStatus = Frame.ACTIVE;
        }
      } else if ( roll === 1 ) {
        if ( this.frameStatus !== Frame.STRIKE_EXTRA ) {
          if ( pins + this.roll[0] === 10 ) {
            this.frameStatus = Frame.SPARE_EXTRA;
          } else {
            this.frameStatus = Frame.SCORED;
          }
        }
      }
    } else {
      if ( roll === 0 ) {
        if ( pins === 10 ) {
          this.frameStatus = Frame.STRIKE;
        } else {
          this.frameStatus = Frame.ACTIVE;
        }
      } else if ( roll === 1 ) {
        if ( pins + this.roll[0] === 10 ) {
          this.frameStatus = Frame.SPARE;
        } else {
          this.frameStatus = Frame.SCORED;
        }
      }
    }
    this.calculateScore();
  };
  Frame.prototype.calculateScore = function() {
    // We score based on frame status (see below)
    var oneAhead = this.set[this.position + 1], twoAhead = this.set[this.position + 2];
    if ( this.frameStatus === Frame.SCORED ) {
      this.score = this.roll[0] + this.roll[1];
    } else if ( this.frameStatus === Frame.SPARE ) {
      // We can only score a spare if the next roll is scored
      if ( oneAhead.roll[0] !== null ) {
        this.score = oneAhead.roll[0] + 10;
      }
    } else if ( this.frameStatus === Frame.STRIKE ) {
      // If we have a strike on the 9th frame, we have to score it
      // differently since there's only 1 frame ahead
      if ( oneAhead.position === 9 ) {
        if ( oneAhead.roll[0] !== null && oneAhead.roll[1] !== null ) {
          this.score = oneAhead.roll[0] + oneAhead.roll[1] + 10;
        }
      } else {
        if ( oneAhead.frameStatus === Frame.STRIKE ) {
          if ( oneAhead.roll[0] !== null && twoAhead.roll[0] !== null ) {
            this.score = oneAhead.roll[0] + twoAhead.roll[0] + 10;
          }
        } else if ( oneAhead.roll[1] !== null ) {
          this.score = oneAhead.roll[0] + oneAhead.roll[1] + 10;
        }
      }
    } else if ( this.frameStatus === Frame.STRIKE_EXTRA && this.roll[2] !== null ) {
      this.score = this.roll[1] + this.roll[2] + 10;
    } else if ( this.frameStatus === Frame.SPARE_EXTRA && this.roll[2] !== null ) {
      this.score = this.roll[2] + 10 + this.roll[0] + this.roll[1];
    }
    return this.score;
  };

  Frame.UNPLAYED = 0;    // player has not yet thrown a ball in this frame
  Frame.ACTIVE = 1;      // player has thrown the first roll only
  Frame.SCORED = 2;      // player has thrown both rolls, and scored a total of less than 10
  Frame.SPARE = 3;       // player has scored a spare
  Frame.STRIKE = 4;      // player has score a strike
  // 10th frame states
  Frame.SPARE_EXTRA = 5; // player has score a spare on the 10th frame
  Frame.STRIKE_EXTRA = 6;// player has score a strike on the 10th frame

  function Renderer(game, div) {
    this.game = game;
    this.rootDiv = window.document.getElementById(div);
  };
  Renderer.prototype.renderState = function() {
    switch (this.game.state) {
      case Bowl.WELCOME_SCREEN:
        this.renderWelcomeScreen();
        break;
      case Bowl.PLAYER_SELECT:
        this.renderPlayerSelect();
        break;
      case Bowl.GAME_ACTIVE:
        this.renderGameScreen();
        break;
    }
    this.checkEventListeners();
  };
  Renderer.prototype.checkEventListeners = function() {
    var _this = this;
    switch (this.game.state) {
      case Bowl.WELCOME_SCREEN:
        document.getElementById('new-button').addEventListener('click', function(event) {
          _this.game.startNewGame();
        });
        break;
      case Bowl.PLAYER_SELECT:
        document.getElementById('start-game').addEventListener('click', function(event) {
          _this.game.resetGame();
        });
        break;
      case Bowl.GAME_ACTIVE:
        document.getElementById('bowl-button').addEventListener('click', function(event) {
          _this.throwBall();
        });
        document.getElementById('bowl-strike').addEventListener('click', function(event) {
          _this.throwStrike();
        });
        break;
    }
  };
  Renderer.prototype.renderWelcomeScreen = function() {
    var initialHtml = "<button id='new-button'>Start new game</button><button name='continue'>Continue current game</button>";
    this.rootDiv.innerHTML = initialHtml;
  };
  Renderer.prototype.renderPlayerSelect = function() {
    var html = '<div class="players">Enter the names of up to ' + this.game.maxPlayers + ' players:</div>';
    for ( var i = 0; i < this.game.maxPlayers; i++ ) {
      html += '<div class="player">Player ' + (i+1).toString() + ': <input type="text" id="player_' + i + '"></div>';
    }
    html += '<button id="start-game">Start Game</button>';
    this.rootDiv.innerHTML = html;
  };
  Renderer.prototype.renderGameScreen = function() {
    var scoreTableHtml = '<table class="scoreTable"><tr class="heading"><th rowspan="2">Player</th><th colspan="10">Frames</th></tr><tr>';
    for ( var i = 0; i < 10; i++ ) {
      scoreTableHtml += '<th>' + (i+1).toString() + '</th>';
    }
    scoreTableHtml += '</tr>';
    for ( var i in this.game.player ) {
      scoreTableHtml += '<tr class="player"><td class="playerName">' + this.game.player[i].name + '</td>';
      for ( var j = 0; j < 10; j++ ) {
        var id = i.toString() + '_' + j.toString();
        scoreTableHtml += '<td class="box frame_' + j + '" id="player_' + id + '"><div class="rolls cf"><div class="roll_0" id="roll_' + id + '_0"></div><div class="roll_1" id="roll_' + id + '_1"></div>';
        if ( j === 9 ) scoreTableHtml += '<div class="roll_2" id="roll_' + id + '_2"></div>';
        scoreTableHtml += '</div><div class="score" id="score_' + id + '"></div></td>';
      }
      scoreTableHtml += '</tr>';
    }
    scoreTableHtml += '</table>';

    var menuHtml = '<div id="menu">Menu:<ul><li><button id="bowl-button">Bowl (Random)</button></li><li><button id="bowl-strike">Bowl Strike</button></li><li><button id="pause-button">Pause Game</button></li></ul></div>';

    var alleyHtml = '<div id="alley" class="alley"><div class="gutter top"></div><div class="lane"><div id="ball" class="ball static"></div><div class="pins">';
    for ( var i = 0; i < 10; i++ ) {
      alleyHtml += '<div id="pin_' + i.toString() + '" class="pin pin_' + i.toString() + '"></div>';
    }
    alleyHtml += '</div></div><div class="gutter bottom"></div></div>';
    this.rootDiv.innerHTML = scoreTableHtml + menuHtml + alleyHtml;
  };
  Renderer.prototype.highlightBox = function() {
    var _this = this;
    var highlight = function() {
      var frameBox = _this.getCurrentFrameBox();
      if ( frameBox.containsClass('highlight') ) {
        frameBox.removeClass("highlight");
      } else {
        frameBox.addClass('highlight');
      }
    };
    // Highlight immediately to show movement
    highlight.call();
    // setInterval is bad, but is acceptable in this situation...
    this.highlighter = setInterval(highlight, 1250);
  };
  Renderer.prototype.getCurrentFrameBox = function() {
    return document.getElementById('player_' + this.game.currentPlayer + '_' + this.game.currentFrame);
  };
  Renderer.prototype.finishTurn = function() {
    window.clearInterval(this.highlighter);
    this.getCurrentFrameBox().removeClass("highlight");
  };
  Renderer.prototype.startTurn = function() {
    this.highlightBox();
    document.getElementById('bowl-strike').innerHTML = "Bowl Strike";
  };
  Renderer.prototype.animateBall = function(callback) {
    document.getElementById('ball').removeClass('static').addClass('active');
    setTimeout(callback, 1000);
  };
  Renderer.prototype.throwBall = function() {
    var _this = this;
    var callback = function() {
      _this.game.pinStrike();
    };
    this.animateBall(callback);
  };
  Renderer.prototype.throwStrike = function() {
    var _this = this;
    var callback = function() {
      _this.game.pinStrike(Frame.STRIKE);
    };
    this.animateBall(callback);
  };
  Renderer.prototype.pinStrike = function(pins) {
    // In a real bowling game, it's impossible to knock down certain
    // pins without hitting others. Try to visually simulate something
    // close to reality.
    if ( this.game.currentPins === 10 ) {
      // One pin is likely to be one of the outer pins in the back
      if ( pins === 1 ) {
      }
    } else {
    }
  };
  Renderer.prototype.resetBall = function() {
    document.getElementById('ball').removeClass('active').addClass('static');
  };
  Renderer.prototype.nextThrow = function() {
    this.resetBall();
    document.getElementById('bowl-strike').innerHTML = "Bowl Spare";
  };





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
  Bowl.prototype.resetGame = function() {
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
      alert('Please enter at least one player!');
      return;
    }
    this.beginGame();
  };
  Bowl.prototype.beginGame = function() {
    this.currentFrame = 0;
    this.currentRoll = 0;
    this.currentPlayer = 0;
    this.currentPins = 10;
    this.state = Bowl.GAME_ACTIVE;
    this.renderer.renderState();
    this.renderer.startTurn();
  };
  Bowl.prototype.pinStrike = function(type) {
    // Hit a random number of pins
    var pins = Math.floor(Math.random() * (this.currentPins + 1));
    // Unless we're throwing a strike/spare, then override the random number
    if ( type === Frame.SPARE || type === Frame.STRIKE ) {
      pins = this.currentPins;
    }
    this.currentPins -= pins;
    this.recordScore(pins);
    if ( this.currentFrame === 9 ) {
      // If this is the last frame, they get extra rolls in certain cases
      if ( this.currentRoll === 0 ) {
        if ( pins === 10 ) {
          this.currentPins = 10;
        }
        this.currentRoll++;
      } else if ( this.currentRoll === 1 ) {
        if ( this.getCurrentFrame().frameStatus === Frame.STRIKE_EXTRA ) {
          if ( pins === 10 ) {
            this.currentPins = 10;
          }
          this.currentRoll++;
        } else {
          if ( this.currentPins === 0 ) {
            this.currentPins = 10;
            this.currentRoll++;
          } else {
            this.nextPlayer();
          }
        }
      } else {
        this.nextPlayer();
      }
    } else {
      if ( pins === 10 || this.currentRoll === 1 ) {
        this.nextPlayer();
      } else {
        this.currentRoll++;
      } 
    }
    this.renderer.nextThrow();
  };
  Bowl.prototype.nextPlayer = function() {
    this.renderer.finishTurn();
    this.currentPlayer++;
    this.currentRoll = 0;
    this.currentPins = 10;
    if ( this.currentPlayer === this.player.length ) {
      this.currentPlayer = 0;
      this.currentFrame++;
    }
    if ( this.currentFrame === 10 ) {
      this.state = Bowl.GAME_OVER;
      this.renderer.renderState();
    } else {
      this.renderer.startTurn();
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
    var rollBox0 = document.getElementById('roll_' + this.currentPlayer + '_' + this.currentFrame + '_0');
    var rollBox1 = document.getElementById('roll_' + this.currentPlayer + '_' + this.currentFrame + '_1');
    var rollBox2 = document.getElementById('roll_' + this.currentPlayer + '_' + this.currentFrame + '_2');
    if ( this.currentFrame === 9 ) {
      if ( this.currentRoll === 0 ) {
        if ( pins === 10 ) {
          rollBox0.innerHTML = "X";
        } else {
          rollBox0.innerHTML = pins;
        }
      } else if ( this.currentRoll === 1 ) {
        if ( pins === 10 ) {
          rollBox1.innerHTML = "X";
        } else if ( this.getCurrentFrame().roll[0] + pins === 10 ) {
          rollBox1.innerHTML = "/";
        } else {
          rollBox1.innerHTML = pins;
        }
      } else if ( this.currentRoll === 2 ) {
        if ( pins === 10 ) {
          rollBox2.innerHTML = "X";
        } else if ( this.getCurrentFrame().roll[1] + pins === 10 ) {
          rollBox2.innerHTML = "/";
        } else {
          rollBox2.innerHTML = pins;
        }
      }
    } else {
      if ( this.currentRoll === 0 ) {
        if ( pins === 10 ) {
          rollBox1.innerHTML = "X";
        } else {
          rollBox0.innerHTML = pins;
        }
      } else if ( this.currentRoll === 1 ) {
        if ( this.getCurrentFrame().frameStatus === Frame.SPARE ) {
          rollBox1.innerHTML = "/";
        } else {
          rollBox1.innerHTML = pins;
        }
      }
    }
    this.tallyTotalScore();
  };
  Bowl.prototype.tallyTotalScore = function() {
    var score = 0, totalScore = 0, scoreBox = undefined, i = 0, prevScore = null;

    // We start at the current frame and see if we can record a score.
    // Then, go backwards down the frames to check for any nulls; see if we
    // can now score them
    for ( i = this.currentFrame; i >= 0; i-- ) {
      this.getCurrentPlayer().frameSet[i].calculateScore();
    }

    // Now go through each frame ascending and calculate the total score
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

  Bowl.WELCOME_SCREEN = 1;
  Bowl.PLAYER_SELECT = 2;
  Bowl.GAME_START = 3;
  Bowl.GAME_ACTIVE = 4;
  Bowl.GAME_OVER = 5;

  // create our global access variable
  if ( typeof window.Bowl === 'undefined' ) {
    window.Bowl = Bowl;
  }
})();
