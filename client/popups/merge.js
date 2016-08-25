import { Template } from 'meteor/templating';
import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js';

import { selectedBranch } from '/client/branch.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.popupMerge.onCreated(function() {
  this.conflictResultVar = new ReactiveVar({});
});

Template.popupMerge.onRendered(function() {
  this.conflictResultVar.set({});
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

    if (Object.keys(template.conflictResultVar.get()).length) {
      let newMap = $.extend(template.conflictResultVar.get(),this.get('data').nonConflicts);
      Branch.findOne(selectedBranch.get()).applyConflictResolution(newMap);
    }
    conflictResolutionResult = {};
    template.conflictResultVar.set({});
    console.log("Merge");
    Branch.findOne(selectedBranch.get()).merge();
    selectedBranch.set(undefined);
  },
  'click .continue-button'(event, template) {
    // TODO create version, apply patch and do not push to master
    if (Object.keys(template.conflictResultVar.get()).length) {
      let newMap = $.extend(template.conflictResultVar.get(),this.get('data').nonConflicts);
      Branch.findOne(selectedBranch.get()).applyConflictResolution(newMap);
    }
    template.conflictResultVar.set({});
    conflictResolutionResult = {};
  },
  'click .conflict'(event, template) {
    var idElemClicked = $(event.currentTarget).attr('idelement');
    var whichBranch = $(event.currentTarget).attr('branch');
    conflictResolutionResult[idElemClicked] = this.get('data').conflicts[idElemClicked][whichBranch];
    template.conflictResultVar.set(conflictResolutionResult);
  }
});

Template.popupMerge.helpers({
  conflictResolutionCompleted() {

    if (this.get('data') && this.get('data').conflicts) {

      if (Object.keys(this.get('data').conflicts).length == 0) {
        return {}
      }
      if (Object.keys(Template.instance().conflictResultVar.get()).length >= Object.keys(this.get('data').conflicts).length) {
        return {};
      }
      return {disabled:'disabled'};
    } else {
      return {};
    }

  },
  conflictElementStatus(key, branch) {
    if (this.get('data') && this.get('data').conflicts) {
      if (Object.keys(Template.instance().conflictResultVar.get()).length == 0) {
        return 'panel-default';
      } else if (JSON.stringify(Template.instance().conflictResultVar.get()[key]) == JSON.stringify(this.get('data').conflicts[key][branch])) {
        return 'panel-success';
      } else {
        return 'panel-danger';
      }
    } else return '';
  },
  getconflict(key) {
    return this.get('data').conflicts[key];
  },
  getOperationType(patch) {
    return patch[0].op;
  },
  keys() {
    if (this.get('data') && this.get('data').conflicts)
      return Object.keys(this.get('data').conflicts);
    else
      return [];
  },
  data() {
    if (this.get('data') && this.get('data').conflicts)
      return JSON.stringify(this.get('data').conflicts);
    else
      return '';
  }
});