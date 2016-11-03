import { Template } from 'meteor/templating';

import { Branch } from '/imports/synchronization/branch.js';

import { selectedBranch } from '/client/branch.js';
import { Notification } from '/imports/notifications/notifications.js';

Template.popupNewBranch.events({
  'shown.bs.modal .modal'(event,template) {
    template.find('input').focus();
  },
  'keyup input, change input'(event,template) {
    this.set('name',template.find('input').value);
  },
  'click button.create, submit form'(event,template) {
    event.preventDefault();
    // Create a new branch from the currently selected one
    var old_branch = Branch.findOne(selectedBranch.get()),
        branch = old_branch.branch(this.get('name'));
    selectedBranch.set(branch._id);    
    
    // Close dialog
    this.set('name','');
    var notif = new Notification();
    notif.status = 3;
    notif.description = "Branch created";
    notif.save();
    template.$('.modal').modal('hide');

  }
});

Template.popupNewBranch.helpers({
  name() { return this.get('name'); },
  notHasName() { return !this.get('name'); }
});
