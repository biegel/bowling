// Let's augment some native javascript classes with some useful methods
Element.prototype.addClass = function(newClass) {
  var newClasses = newClass.split(" ");
  var classes = this.className.split(" "), comp = {}, reduced = [];
  for ( var i in newClasses ) {
    classes.push(newClasses[i]);
  }
  for ( var i in classes ) {
    if ( comp[classes[i]] === undefined ) {
      comp[classes[i]] = true;
      reduced.push(classes[i]);
    }
  }
  this.className = reduced.join(" ");
  return this;
};
Element.prototype.removeClass = function(oldClass) {
  var oldClasses = oldClass.split(" ");
  var classes = this.className.split(" "), reduced = [], found = false;
  for ( var i in classes ) {
    found = false;
    for ( var j in oldClasses ) {
      if ( classes[i] === oldClasses[j] ) {
        found = true;
      }
    }
    if ( !found ) {
      reduced.push(classes[i]);
    }
  }
  this.className = reduced.join(" ");
  return this;
};
Element.prototype.containsClass = function(checkClass) {
  var classes = this.className.split(" ");
  for ( var i in classes ) {
    if ( classes[i] === checkClass ) {
      return true;
    }
  }
  return false;
};
Array.prototype.filter = function(boolFunc) {
  if ( !this.length ) return this;
  var filtered = [];
  for ( var i = 0; i < this.length; i++ ) {
    if ( boolFunc.apply(this, [this[i]]) ) {
      filtered.push(this[i]);
    }
  }
  return filtered;
};
Array.prototype.map = function(mapFunc) {
  var mapped = [];
  for ( var i = 0; i < this.length; i++ ) {
    mapped.push(mapFunc(i, this[i]));
  }
  return mapped;
};
