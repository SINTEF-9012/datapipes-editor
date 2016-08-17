import { Meteor } from 'meteor/meteor';
import { Branch, Version } from '/imports/synchronization/version.js';
import { BigmlComponent } from '/imports/components/basic.js';
Meteor.startup(() => {
  var master = Branch.findOne('master');
  
  if (!master) {
    // Create a default master branch
    master = new Branch();
    master._id = 'master';
    master.name = 'Master';
    
    // Create an empty first version add it an element
    var v = new Version();
    v.elements.push(new BigmlComponent);
    master.versions.push(v);

    master.save();
  }
});
