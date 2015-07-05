// Class for a player
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
