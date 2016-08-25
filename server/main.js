import { Meteor } from 'meteor/meteor';
import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js'

Meteor.startup(() => {
  var master = Branch.findOne('master');
  
  if (!master) {
    // Create a default master branch
    master = new Branch();
    master._id = 'master';
    master.name = 'Master';
    
    // Create an empty first version add it an element
    var v = new Version();
    master.versions.push(v);

    master.save();
  }
});
