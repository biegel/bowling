// Class for a frame
function Frame(position, set) {
  this.position = position;
  this.set = set;
  this.reset();
};
Frame.prototype.reset = function() {
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
    this.score = this.roll[2] + 10;
  }
  return this.score;
};

// Constants for possible frame states
Frame.UNPLAYED = 0;    // player has not yet thrown a ball in this frame
Frame.ACTIVE = 1;      // player has thrown the first roll only
Frame.SCORED = 2;      // player has thrown both rolls, and scored a total of less than 10
Frame.SPARE = 3;       // player has scored a spare
Frame.STRIKE = 4;      // player has score a strike
// 10th frame states
Frame.SPARE_EXTRA = 5; // player has score a spare on the 10th frame
Frame.STRIKE_EXTRA = 6;// player has score a strike on the 10th frame
