import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.popups.helpers({
  newContext() { return new ReactiveDict(); }
});

Template.popupNewBranch.events({
  'keyup input, change input'(event,template) {
    this.set('name',template.find('input').value);
  },
  'click button.create'(event,template) {
    console.log('Create!!',this.get('name'));
    
    // Close dialog
    this.set('name','');
    template.$('.modal').modal('hide');
  }
});

Template.popupNewBranch.helpers({
  name() { return this.get('name'); },
  notHasName() { return !this.get('name'); }
});