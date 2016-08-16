import { Template } from 'meteor/templating';

Template.popupMerge.events({
  'click button, submit form'(event,template) {
    event.preventDefault();
    // Do something usefull
    
    // Close dialog
    template.$('.modal').modal('hide');
  }
});

Template.popupMerge.helpers({
  data() {
    return JSON.stringify(this.get('data'));
  }
});