function Renderer(game, div) {
  this.game = game;  // reference to the Bowl instance
  this.rootDiv = window.document.getElementById(div);
  this.pinStatus = [1,1,1,1,1,1,1,1,1,1]; // 1 = pin standing, 0 = pin knocked down

  // These are patterns for possible pin strikes.
  // The keys represent the number of pins knocked down,
  // and the array sets represent the index of the pins
  // on the bowling alley.
  this.pinPatterns = {
    1: [
      [6],
      [9]
    ],
    2: [
      [3,6],
      [3,7],
      [5,8],
      [5,9],
      [6,7],
      [8,9]
    ],
    3: [
      [3,6,7],
      [3,4,7],
      [5,8,9],
      [4,8,9]
    ],
    4: [
      [1,4,5,7],
      [1,3,6,7],
      [1,4,7,8],
      [3,4,6,7],
      [2,4,5,8],
      [2,5,8,9],
      [2,4,7,8],
      [2,4,8,9],
      [0,1,3,4],
      [0,1,2,4],
      [0,2,5,8],
      [0,1,3,7]
    ],
    5: [
      [1,3,4,6,7],
      [1,3,4,7,8],
      [0,1,2,3,6],
      [0,1,2,4,7],
      [0,1,3,4,7],
      [0,1,4,7,8],
      [0,1,3,6,7],
      [0,1,2,4,5],
      [0,2,4,5,8],
      [0,2,4,5,9],
      [0,2,5,8,9],
      [0,2,4,7,8],
      [0,1,2,4,8]
    ],
    6: [
      [0,1,2,3,6,7],
      [0,1,3,4,6,7],
      [0,1,3,4,7,8],
      [0,1,2,4,8,9],
      [0,1,2,4,5,9],
      [0,1,2,5,8,9],
      [2,4,5,7,8,9],
      [1,3,4,6,7,8],
      [1,3,4,5,7,8],
      [2,4,5,6,7,8]
    ],
    7: [
      [0,1,2,3,4,5,9],
      [0,1,2,3,4,5,8],
      [0,1,2,3,4,5,7],
      [0,1,2,3,4,7,8],
      [0,1,2,3,4,6,7],
      [0,1,2,3,4,8,9],
      [0,1,2,4,5,7,8],
      [0,2,4,5,7,8,9],
      [0,2,3,4,7,8,9],
      [1,2,3,4,5,8,9],
      [1,2,3,4,5,6,7],
      [1,3,4,5,6,7,8],
      [1,3,4,5,7,8,9]
    ],
    8: [
      [0,1,2,3,4,5,8,9],
      [0,1,2,3,4,5,7,8], // 7-10 split!
      [0,1,2,3,4,5,6,7],
      [0,1,2,4,5,7,8,9],
      [0,1,2,3,5,7,8,9],
      [0,1,2,3,4,6,7,8]
    ],
    9: [
      [0,1,2,3,4,5,7,8,9],
      [0,1,2,3,4,5,6,7,8],
      [0,1,2,3,4,5,6,8,9],
      [0,1,2,3,4,5,6,7,9],
      [0,1,2,3,4,6,7,8,9],
      [0,1,2,4,5,6,7,8,9]
    ],
    10: [
      [0,1,2,3,4,5,6,7,8,9]
    ]
  };
  this.busy = false;     // whether an animation is running
  this.dictionary = {};  // the dictionary for the user's language of choice
};
Renderer.prototype.setLanguage = function() {
  var langs = document.getElementsByName('lang');
  for ( var i in langs ) {
    if ( langs[i].checked ) {
      this.dictionary = window.dictionary[langs[i].value];
    }
  }
  return true;
};

// This is a translation method.  It takes a dictionary key
// and returns a simple string or a parsed string from the user's
// target language dictionary
Renderer.prototype._ = function(key) {
  var replacements = arguments[1];
  if ( replacements === undefined ) {
    return this.dictionary[key];
  } else {
    var template = this.dictionary[key];
    for ( var i in replacements ) {
      template = template.replace('%' + i + '%', replacements[i]);
    }
    return template;
  }
};

// Renders a game state when the state changes
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
    case Bowl.GAME_OVER:
      this.renderEndScreen();
      break;
  }
  this.checkEventListeners();
};
Renderer.prototype.checkEventListeners = function() {
  var _this = this;
  switch (this.game.state) {
    case Bowl.WELCOME_SCREEN:
      document.getElementById('new-button').addEventListener('click', function(event) {
        !_this.busy && _this.setLanguage() && _this.game.startNewGame();
      });
      break;
    case Bowl.PLAYER_SELECT:
      document.getElementById('start-game').addEventListener('click', function(event) {
        !_this.busy && _this.game.setPlayers();
      });
      break;
    case Bowl.GAME_ACTIVE:
      document.getElementById('bowl-button').addEventListener('click', function(event) {
        !_this.busy && _this.game.determinePins() && _this.throwBall();
      });
      document.getElementById('bowl-strike').addEventListener('click', function(event) {
        !_this.busy && _this.game.determinePins(Frame.STRIKE) && _this.throwBall();
      });
      break;
    case Bowl.GAME_OVER:
      document.getElementById('same-players').addEventListener('click', function(event) {
        !_this.busy && _this.resetSamePlayers();
      });
      document.getElementById('new-players').addEventListener('click', function(event) {
        !_this.busy && _this.resetNewPlayers();
      });
      document.getElementById('finished').addEventListener('click', function(event) {
        document.location.href = 'http://babbel.com';
      });
      break;
  }
};
Renderer.prototype.renderWelcomeScreen = function() {
  var initialHtml = 'Choose your language:<ul><li><input type="radio" name="lang" value="en" checked="checked" id="lang_en"><label for="lang_en">English</label></li><li><input type="radio" name="lang" value="de" id="lang_de"><label for="lang_de">Deutsch</label></li><li><input type="radio" name="lang" value="fr"><label for="lang_fr">Fran&#231;ais</label></li></ul><button id="new-button">Start new game</button>';
  this.rootDiv.innerHTML = initialHtml;
};
Renderer.prototype.renderPlayerSelect = function() {
  var html = '<div class="players">' + this._('PLAYER_SELECT_TITLE', {'N': this.game.maxPlayers}) + ':</div><ul>';
  for ( var i = 0; i < this.game.maxPlayers; i++ ) {
    html += '<li class="player">' + this._('PLAYER_NUMBER', {'N': (i+1).toString()}) + ': <input type="text" id="player_' + i + '" maxlength="15"></li>';
  }
  html += '</ul><button id="start-game">' + this._('START_GAME') + '</button>';
  this.rootDiv.innerHTML = html;
};
Renderer.prototype.renderGameScreen = function() {
  var scoreTableHtml = '<table class="scoreTable"><tr class="heading"><th rowspan="2">' + this._('PLAYER') + '</th><th colspan="10">' + this._('FRAMES') + '</th></tr><tr>';
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

  var menuHtml = '<div class="menu" id="menu">Menu:<ul><li><button id="bowl-button">' + this._('BOWL_NORMAL') + '</button></li><li><button id="bowl-strike">' + this._('BOWL_STRIKE') + '</button></li></ul></div>';

  var alleyHtml = '<div id="alley" class="alley"><div class="gutter top"></div><div class="lane"><div id="ball" class="ball static"></div><div class="pins">';
  for ( var i = 0; i < 10; i++ ) {
    alleyHtml += '<div id="pin_' + i.toString() + '" class="pin pin_' + i.toString() + '"></div>';
  }
  alleyHtml += '</div></div><div class="gutter bottom"></div></div>';
  this.rootDiv.innerHTML = scoreTableHtml + '<div id="below-score">' + menuHtml + alleyHtml + '</div>';
};
Renderer.prototype.renderEndScreen = function() {
  // Get the highest score
  var highScore = undefined;
  for ( var i = 0; i < this.game.player.length; i++ ) {
    if ( this.game.player[i].totalScore > highScore || highScore === undefined ) {
      highScore = this.game.player[i].totalScore;
    }
  }

  // Now determine the winners
  var winners = [];
  for ( var i in this.game.player ) {
    if ( this.game.player[i].totalScore === highScore ) {
      winners.push(this.game.player[i].name);
    }
  }

  var winnerMessageKey = winners.length > 1 ? 'WINNER_MESSAGE_TIE' : 'WINNER_MESSAGE';
  var winnerText = winners.length > 1 ? winners.join(" " + this._('AND') + " ") : winners.pop();
  winnerText += ', ' + this._('POINT_TOTAL', {'N': highScore});
  var winnerHtml = '<div class="winner"><div class="message">' + this._(winnerMessageKey) + '<span class="winner_list">' + winnerText + '</span>' + this._('PLAY_AGAIN') + '</div><ul><li><button id="same-players">' + this._('SAME_PLAYERS') + '</button></li><li><button id="new-players">' + this._('NEW_PLAYERS') + '</button></li><li><button id="finished">' + this._('FINISHED') + '</button></li></ul>';
  document.getElementById('below-score').innerHTML = winnerHtml;
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
  this.busy = false;
  this.highlightBox();
  this.resetPins();
  document.getElementById('bowl-strike').innerHTML = this._('BOWL_STRIKE');
};
Renderer.prototype.resetPins = function() {
  this.pinStatus = [1,1,1,1,1,1,1,1,1,1];
  for ( var i = 0; i < this.pinStatus.length; i++ ) {
    document.getElementById('pin_' + i).removeClass('knocked_0 knocked_1 knocked_2 knocked_3');
  }
  document.getElementById('bowl-strike').innerHTML = this._('BOWL_STRIKE');
};
Renderer.prototype.animateBall = function(callback) {
  var duration = 500, _this = this;
  this.busy = true;
  document.getElementById('ball').removeClass('static').addClass('active').setAttribute("style", "transition-duration: " + duration + "ms");
  setTimeout(callback, duration);

  // Set the pin strike timeouts
  setTimeout(function(){
    _this.knockPins();
  }, 400);
};
Renderer.prototype.recordScore = function(pins) {
  var rollBox0 = document.getElementById('roll_' + this.game.currentPlayer + '_' + this.game.currentFrame + '_0');
  var rollBox1 = document.getElementById('roll_' + this.game.currentPlayer + '_' + this.game.currentFrame + '_1');
  var rollBox2 = document.getElementById('roll_' + this.game.currentPlayer + '_' + this.game.currentFrame + '_2');
  if ( this.game.currentFrame === 9 ) {
    if ( this.game.currentRoll === 0 ) {
      if ( pins === 10 ) {
        rollBox0.innerHTML = "X";
      } else {
        rollBox0.innerHTML = pins;
      }
    } else if ( this.game.currentRoll === 1 ) {
      if ( pins === 10 ) {
        rollBox1.innerHTML = "X";
      } else if ( this.game.getCurrentFrame().roll[0] + pins === 10 ) {
        rollBox1.innerHTML = "/";
      } else {
        rollBox1.innerHTML = pins;
      }
    } else if ( this.game.currentRoll === 2 ) {
      if ( pins === 10 ) {
        rollBox2.innerHTML = "X";
      } else if ( this.game.getCurrentFrame().roll[1] + pins === 10 ) {
        rollBox2.innerHTML = "/";
      } else {
        rollBox2.innerHTML = pins;
      }
    }
  } else {
    if ( this.game.currentRoll === 0 ) {
      if ( pins === 10 ) {
        rollBox1.innerHTML = "X";
      } else {
        rollBox0.innerHTML = pins;
      }
    } else if ( this.game.currentRoll === 1 ) {
      if ( this.game.getCurrentFrame().frameStatus === Frame.SPARE ) {
        rollBox1.innerHTML = "/";
      } else {
        rollBox1.innerHTML = pins;
      }
    }
  }
};
Renderer.prototype.throwBall = function() {
  var _this = this;
  var callback = function() {
    _this.busy = false;
    _this.game.pinStrike();
  };
  this.animateBall(callback);
};
Renderer.prototype.knockPins = function() {
  var pins = this.game.currentPinStrike
  // In a real bowling game, it's very hard to knock down certain
  // pins without hitting others when all 10 pins are standing.
  // Try to visually simulate something close to reality based on some common
  // strike patterns seen in normal bowling games.
  if ( pins > 0 ) {
    if ( this.game.currentPins === 10 ) {
      // Choose from one of the likely standard pinstrike patterns
      var index = Math.floor(Math.random() * this.pinPatterns[pins].length);
      var pattern = this.pinPatterns[pins][index];
      for ( var i = 0; i < pattern.length; i++ ) {
        this.pinStatus[pattern[i]] = 0;
      }
    } else {
      // On your second throw, we just randomly select pins to knock down, as
      // this is closer to how a real game might work in reality.
      var nextStatus = this.pinStatus.map(function(key, value) {
        if ( value === 1 ) {
          return key;
        } else {
          return null;
        }
      }).filter(function(){
        return arguments[0] !== null;
      });
      var pinsStanding = nextStatus.length;
      for ( var i = 0; i < pinsStanding - pins; i++ ) {
        var index = Math.floor(Math.random() * nextStatus.length);
        nextStatus.splice(index, 1);
      }
      while ( nextStatus.length ) {
        var index = nextStatus.pop();
        this.pinStatus[index] = 0;
      }
    }
  }
  for ( var i in this.pinStatus ) {
    if ( this.pinStatus[i] === 0 ) {
      var direction = Math.floor(Math.random() * 4);
      document.getElementById('pin_' + i).addClass('knocked_' + direction);
    }
  }
};
Renderer.prototype.resetBall = function() {
  document.getElementById('ball').removeClass('active').addClass('static').setAttribute("style", "");
};
Renderer.prototype.nextThrow = function() {
  this.resetBall();
  document.getElementById('bowl-strike').innerHTML = this._('BOWL_SPARE');
};
Renderer.prototype.resetSamePlayers = function() {
  this.game.beginGame();
};
Renderer.prototype.resetNewPlayers = function() {
  this.game.startNewGame();
};
Renderer.prototype.playerCountError = function() {
  alert(this._('NO_PLAYERS_ENTERED'));
};
Renderer.prototype.nextPlayer = function() {
  var _this = this;
  this.busy = true;
  setTimeout(function() {
    _this.startTurn();
  }, 500);
};
