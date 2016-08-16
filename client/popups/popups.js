import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';


// Functions to call from the outside
var popups = {};
var PopupShow = function(name, data) {
  if (popups[name]) {
    if (data)
      popups[name].data.set('data',data);
    popups[name].$('div.modal').modal();
  }
};
var PopupHide = function(name) {
  if (popups[name])
    popups[name].$('div.modal').modal('hide');
};

Template.popups.helpers({
  newContext() { return new ReactiveDict(); }
});


// Add children to the list
Template.popupNewBranch.onCreated(function() {
  popups['newbranch'] = this;
});
Template.popupMerge.onCreated(function() {
  popups['merge'] = this;
});


// Exports
export { PopupShow, PopupHide };