import { FlowRouter } from 'meteor/kadira:flow-router';
import { Blaze } from 'meteor/blaze';

import { Branch, Version } from '/imports/synchronization/version.js';
import { selectedBranch } from '/client/branch.js';

Template.leftbar.events({
  'click ul.nav>li>a'(event) {
    event.preventDefault();
    FlowRouter.go(event.target.getAttribute('href'));
  },
  'change select'(event,template) {
    selectedBranch.set(template.find('select').value);
  },
  'click button.new'(event) {
    $('#popupNewBranch').modal();
  },
  'click button.save'(event) {
    console.log('Save branch!');
  },
  'click button.push'(event) {
    console.log('Push branch!');
  }
});

Template.leftbar.helpers({
  branches() {
    return Branch.getUserBranches();
  },
  selectedBranch() {
    return selectedBranch.get();
  },
  isSelectedBranch(branch) {
    if (selectedBranch.get() == undefined)
      return branch._id == 'master';
    else
      return selectedBranch.get() == branch._id;
  }
});

Template.mainarea.helpers({
  masterHead() {
    return Branch.getMasterHead();
  },
  currentHead() {
    var branch = Branch.findOne(selectedBranch.get());
    if (branch)
      return branch.lastVersion();
  }
});