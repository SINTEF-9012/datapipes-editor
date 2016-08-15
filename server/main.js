import { Meteor } from 'meteor/meteor';
import { Branch, Version } from '/imports/synchronization/version.js';

Meteor.startup(() => {
  var master = Branch.findOne('master');
  
  if (!master) {
    // Create a default master branch
    master = new Branch();
    master._id = 'master';
    master.name = 'Master';
    
    // Create an empty first version
    master.versions.push(new Version());
    
    master.save();
  }
});
