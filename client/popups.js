import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Branch, Version } from '/imports/synchronization/version.js';

Template.popups.helpers({
  newContext() { return new ReactiveDict(); }
});

Template.popupNewBranch.events({
  'shown.bs.modal .modal'(event,template) {
    console.log('Modal shown!');
    template.find('input').focus();
  },
  'keyup input, change input'(event,template) {
    this.set('name',template.find('input').value);
  },
  'click button.create, submit form'(event,template) {
    event.preventDefault();
    // Create the new branch
    var branch = Branch.createNewBranch(this.get('name'));
    console.log(branch);
    
    // Close dialog
    this.set('name','');
    template.$('.modal').modal('hide');
  }
});

Template.popupNewBranch.helpers({
  name() { return this.get('name'); },
  notHasName() { return !this.get('name'); }
});