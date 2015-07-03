(function(){
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
  };
  Player.prototype.getScore = function(frame) {
    if ( frame === undefined ) {
      frame = this.currentFrame;
    }
    return this.frameSet[frame].getScore();
  };
  Player.prototype.markScore = function(frame, roll, pins) {
    this.frameSet[frame].markScore(roll, pins);
    return this.frameSet[frame].getScore();
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
  };
  Frame.prototype.markScore = function(roll, pins) {
    this.roll[roll] = pins;
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
    } else if ( roll === 2 ) {
      // TODO
    }
  };
  Frame.prototype.getScore = function() {
    var oneFrameAhead = this.set[this.position + 1], twoFrameAhead = this.set[this.position + 2];
    if ( this.frameStatus === Frame.UNPLAYED ) {
      return null;
    } else if ( this.frameStatus === Frame.ACTIVE ) {
      return null;
    } else if ( this.frameStatus === Frame.SCORED ) {
      return this.roll[0] + this.roll[1];
    } else if ( this.frameStatus === Frame.SPARE ) {
      return oneFrameAhead.getScore() + 10;
    } else if ( this.frameStatus === Frame.STRIKE ) {
      // See if we have enough information to calculate the score for this frame
      if ( oneFrameAhead.frameStatus !== Frame.UNPLAYED && oneFrameAhead.frameStatus !== Frame.ACTIVE ) {
        if ( oneFrameAhead.frameStatus === Frame.STRIKE ) {
          if ( twoFrameAhead.frameStatus === Frame.STRIKE ) {
            return oneFrameAhead.getScore() + twoFrameAhead.getScore() + 10;
          } else if ( twoFrameAhead.frameStatus !== Frame.UNPLAYED ) {
            return oneFrameAhead.getScore() + twoFrameAhead.roll[0] + 10;
          } else {
            return null;
          }
        } else {
          return oneFrameAhead.getScore() + 10;
        }
      } else {
        // Next two rolls are not scorable yet
        return null;
      }
    }
  };
  Frame.UNPLAYED = 0;
  Frame.ACTIVE = 1;
  Frame.SCORED = 2;
  Frame.SPARE = 3;
  Frame.STRIKE = 4;

  function Bowl(div) {
    var _this = this;
    this.maxPlayers = 6;
    this.rootDiv = window.document.getElementById(div);
    var initialHtml = "<button id='new-button'>Start new game</button><button name='continue'>Continue current game</button>";
    this.rootDiv.innerHTML = initialHtml;
    document.getElementById('new-button').addEventListener('click', function(event) {
      _this.startNewGame();
    });
  };
  Bowl.prototype.startNewGame = function() {
    var _this = this;
    delete this.player;
    this.player = [];
    var html = '<div class="players">Enter the names of up to ' + this.maxPlayers + ' players:</div>';
    for ( var i = 0; i < this.maxPlayers; i++ ) {
      html += '<div class="player">Player ' + (i+1).toString() + ': <input type="text" id="player_' + i + '"></div>';
    }
    html += '<button id="start-game">Start Game</button>';
    this.rootDiv.innerHTML = html;
    document.getElementById('start-game').addEventListener('click', function(event) {
      _this.resetGame();
    });
  };
  Bowl.prototype.resetGame = function() {
    // Get the players from the form
    var position = 0;
    for ( var i = 0; i < this.maxPlayers; i++ ) {
      var name = document.getElementById('player_' + i).value.toString().trim();
      if ( name !== "" ) {
        this.initPlayer(name, position);
        position++;
      }
    }
    if ( this.player.length === 0 ) {
      alert('Please enter at least one player!');
      return;
    }
    var html = this.createScoreTableHtml();
    this.rootDiv.innerHTML = html;
  };
  Bowl.prototype.initPlayer = function(name, position) {
    if ( typeof this.player[position] !== 'undefined' ) {
      this.error('Player ' + position + ' already initialized');
      return;
    }
    this.player[position] = new Player(name);
    return this.player[position];
  };
  Bowl.prototype.createScoreTableHtml = function() {
    var scoreTableHtml = '<table class="scoreTable"><tr class="heading"><th rowspan="2">Player</th><th colspan="10">Frames</th></tr><tr>';
    for ( var i = 0; i < 10; i++ ) {
      scoreTableHtml += '<th>' + (i+1).toString() + '</th>';
    }
    scoreTableHtml += '</tr>';
    for ( var i in this.player ) {
      scoreTableHtml += '<tr class="player"><td class="playerName">' + this.player[i].name + '</td>';
      for ( var j = 0; j < 10; j++ ) {
        scoreTableHtml += '<td class="box"><div class="rolls"><div class="roll_0"></div><div class="roll_1"></div></div><div class="score"></div></td>';
      }
      scoreTableHtml += '</tr>';
    }
    scoreTableHtml += '</table>';
    return scoreTableHtml;
  };


  // create our global access variable
  if ( typeof window.Bowl === 'undefined' ) {
    window.Bowl = Bowl;
  }
})();
