import { FlowRouter } from 'meteor/kadira:flow-router';

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
    return [ 'Master', 'Branch 1', 'Branch 2', 'Branch 3' ];
  },
  selectedBranch() {
    return selectedBranch.get();
  },
  isSelectedBranch(branch) {
    return selectedBranch.get() == branch;
  }
});

Template.mainarea.helpers({
  masterHead() {
    return Branch.getMasterHead();
  }
});