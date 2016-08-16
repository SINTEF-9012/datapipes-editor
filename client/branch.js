import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Branch, Version } from '/imports/synchronization/version.js';

const selectedBranch = new ReactiveVar(undefined);

Template.registerHelper('masterBranchSelected', function() {
  return (selectedBranch.get() === undefined || selectedBranch.get() == 'Master');
});
Template.registerHelper('notMasterBranchSelected', function() {
  return !(selectedBranch.get() === undefined || selectedBranch.get() == 'Master');
});

Template.registerHelper('selectedBranch', function() {
  var branch = selectedBranch.get();
  if (branch === undefined || !(branch instanceof Branch))
    return Branch.getMasterBranch();
  else
    return branch;
});

export { selectedBranch };