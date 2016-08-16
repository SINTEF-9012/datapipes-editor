import { Template } from 'meteor/templating';

import { Branch, Version } from '/imports/synchronization/version.js';
import { selectedBranch } from '/client/branch.js';

Template.popupNewBranch.events({
  'shown.bs.modal .modal'(event,template) {
    template.find('input').focus();
  },
  'keyup input, change input'(event,template) {
    this.set('name',template.find('input').value);
  },
  'click button.create, submit form'(event,template) {
    event.preventDefault();
    // Create the new branch
    var branch = Branch.createNewBranch(this.get('name'));
    selectedBranch.set(branch._id);    
    
    // Close dialog
    this.set('name','');
    template.$('.modal').modal('hide');
  }
});

Template.popupNewBranch.helpers({
  name() { return this.get('name'); },
  notHasName() { return !this.get('name'); }
});
