import { Template } from 'meteor/templating';
import { Branch, Version } from '/imports/synchronization/version.js';
import { selectedBranch } from '/client/branch.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.popupMerge.onCreated(function() {
  this.conflictResultVar = new ReactiveVar(new Object());
});

var contains = function(needle) {
  // Per spec, the way to identify NaN is that it is not equal to itself
  var findNaN = needle !== needle;
  var indexOf;

  if(!findNaN && typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf;
  } else {
    indexOf = function(needle) {
      var i = -1, index = -1;

      for(i = 0; i < this.length; i++) {
        var item = this[i];

        if((findNaN && item !== item) || item === needle) {
          index = i;
          break;
        }
      }

      return index;
    };
  }

  return indexOf.call(this, needle) > -1;
};

var conflictResolutionResult = {};
Template.popupMerge.events({
  'click button, submit form'(event,template) {
    event.preventDefault();
    // Do something usefull
    
    // Close dialog
    template.$('.modal').modal('hide');
  },
  'click .push-button'(event, template) {
    if (Object.keys(template.conflictResultVar).length) {
      Branch.findOne(selectedBranch.get()).applyConflictResolution(template.conflictResultVar.get());
    }
    template.conflictResultVar.set({});
    Branch.findOne(selectedBranch.get()).merge();
  },
  'click .continue-button'(event) {
    console.log('continue');
    template.conflictResultVar.set({});
  },
  'click .conflict'(event, template) {
    console.log('click');
    var idElemClicked = $(event.currentTarget).attr('idelement');
    var whichBranch = $(event.currentTarget).attr('branch');
    conflictResolutionResult[idElemClicked] = this.get('data')[idElemClicked][whichBranch];
    template.conflictResultVar.set(conflictResolutionResult);
  }
});

Template.popupMerge.helpers({
  conflictResolutionCompleted() {
    if (!JSON.stringify(this.get('data'))) {
      return {}
    }
    if (Object.keys(Template.instance().conflictResultVar.get()).length == Object.keys(this.get('data')).length) {
      return {};
    }
    return {disabled:'disabled'};

  },
  conflictElementStatus(key, branch) {

    if (Object.keys(Template.instance().conflictResultVar.get()).length == 0) {
      return 'panel-default';
    } else if (JSON.stringify(Template.instance().conflictResultVar.get()[key]) == JSON.stringify(this.get('data')[key][branch])) {
      console.log(Object.keys(Template.instance().conflictResultVar.get()));
      console.log(Object.keys(this.get('data')));
      console.log("YEAH");
      return 'panel-success';
    } else {
      return 'panel-danger';
    }
  },
  getconflict(key) {
    return this.get('data')[key];
  },
  getOperationType(patch) {
    return patch[0].op;
  },
  keys() {
    return Object.keys(this.get('data'));
  },
  data() {
    return JSON.stringify(this.get('data'));
  }
});