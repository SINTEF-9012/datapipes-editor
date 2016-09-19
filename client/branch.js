import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js'

const selectedBranch = new ReactiveVar(undefined);

// Reset the selected branch when userId changes
var prevUserId;
Meteor.autorun(() => {
  if (Meteor.userId() != prevUserId) {
    prevUserId = Meteor.userId();
    selectedBranch.set(undefined);
  }
});


Template.registerHelper('masterBranchSelected', function() {
  return (selectedBranch.get() === undefined || selectedBranch.get() == 'master');
});
Template.registerHelper('notMasterBranchSelected', function() {
  return !(selectedBranch.get() === undefined || selectedBranch.get() == 'master');
});

Template.registerHelper('selectedBranch', function() {
  var id = selectedBranch.get();
  if (id != undefined) {
    var branch = Branch.findOne(id);
    if (branch)
      return branch;
  }
  return Branch.getMasterBranch();
});

export { selectedBranch };