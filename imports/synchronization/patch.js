import { Mongo } from 'meteor/mongo';
import { Class, Type, Validator } from 'meteor/jagi:astronomy';

var jsonpatch = require('fast-json-patch');

/**
 * Transforms an array of Astronomy objects with an ID, to a map with key given by the ID, and values the actual objects (in raw form)
 * @argument {Class[]} arrays - Objects on form { prefix: "...", old: [], new: [] }, to use for calculating diffs
 * @returns {Object.<string, Object>} Object of changes
 */
const ArrayToMap = function(array) {
  return array.reduce((p,c) => {
    if (c instanceof Class && c._id && c._id instanceof Mongo.ObjectID)
      p[c._id._str] = c.raw();
    return p;
  },{});
};

/**
 * Calculates the diff from an old to a new array of elements, and returns the changes that has been done.
 * @argument {...{prefix: string, old: Class[], new: Class[]}} arrays - Arrays (with prefix) to use for calculating diffs
 * @returns {Object} Object of changes
 */
const Diff = function(arrays) {
  var diffs = {};
  for (var i = 0; i < arguments.length; i++) {
    var diff = jsonpatch.compare(ArrayToMap(arguments[i].old),ArrayToMap(arguments[i].new)),
        mapped = {};
    diff.forEach(op => {
      var tokens = op.path.split('/'),
          id = tokens[1];
      if (!mapped[id]) mapped[id] = [];
      op.path = tokens.slice(2).join('.');
      mapped[id].push(op);
    });
    Object.keys(mapped).forEach(id => {
      if (arguments[i].prefix)
        diffs[arguments[i].prefix+'-'+id] = mapped[id];
      else
        diffs[id] = mapped[id];
    });
  }
  return diffs;
};

/**
 * Applies a set of patches (diffs) to arrays of elements. NB! The original objects are modified
 * @argument {Object} pathces - The object with patches to apply
 * @argument {...{prefix: string, arr: Class[]}} arrays - Arrays (with prefix) to be updated
 * @returns {Boolean} The result of the patching
 */
const Apply = function(diffs, arrays) {
  for (var i = 1; i < arguments.length; i++) {
    var arrpatches = Object.keys(diffs).map(key => key.split('-')).filter(tokens => arguments[i].prefix ? tokens[0] == arguments[i].prefix : tokens.length == 1)
                           .map(tokens => arguments[i].prefix ? [tokens[1], tokens.join('-')] : [tokens[0], tokens[0]])
                           .map(keys => [keys[0], diffs[keys[1]]]),
        array = arguments[i].arr.map(c => c.raw());
    
    console.log('Raw: ',array);
    
    // Apply the patches for each array
    arrpatches.forEach(row => {
      var id = row[0],
          changes = row[1];
      
      changes.forEach(change => {
        console.log('Change: ',id, change);
        
        if (change.op == 'add') {
          // Add an object to the array
          if (change.path == '') array.push(change.value);
          else console.error('Add not implemented outside root array!');
          
        } else if (change.op = 'remove') {
          // Remove object from the array
          array = array.filter(c => c._id._str != id);
          
        } else if (change.op = 'replace') {
          // Set values inside objects
          
          
        } else {
          console.error('Operation "'+change.op+'" not implemented in Apply!');
        }
      });
    });
    
    
    
    //console.log(arrpatches,array);
  }
  
  
};

/**
 * Compares two diffs and sorts the operations into sets of conflicting and non-conflicting.
 * @argument {Object} first - First diff to compare
 * @argument {Object} second - Second diff to compare
 * @returns {{conflicting: Object, nonconflicting: Object}} The sets of conflicting and non-conflicting changes in the two diffs
 */
const Compare = function(first, second) {
  var result = { conflicting: {}, nonconflicting: {}},
      keys = Object.keys(first).concat(Object.keys(second)).filter((key,index,array) => array.indexOf(key) == index);
  keys.forEach(key => {
    if (key in first && key in second) {
      // Something changed in both
      if (JSON.stringify(first[key]) == JSON.stringify(second[key])) {
        // We might be lucky and have done the exact same thing in both
        result.nonconflicting[key] = first[key];
      } else {
        // If not, someone needs to resolve this issue
        result.conflicting[key] = [first[key], second[key]];
      }
    } else if (key in first) {
      result.nonconflicting[key] = first[key];
    } else /*if (key in second)*/ {
      result.nonconflicting[key] = second[key];
    }
  });
  return result;
};

export { Diff, Compare, Apply };