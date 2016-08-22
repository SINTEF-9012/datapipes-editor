import { Template } from 'meteor/templating';
import { Branch, Version } from '/imports/synchronization/version.js';
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

    console.log('---------');
    console.log(template.conflictResultVar.get());
    if (Object.keys(template.conflictResultVar.get()).length) {
      let newMap = $.extend(template.conflictResultVar.get(),this.get('data').nonConflicts);
      Branch.findOne(selectedBranch.get()).applyConflictResolution(newMap);
    }
    template.conflictResultVar.set({});
    Branch.findOne(selectedBranch.get()).merge();
  },
  'click .continue-button'(event) {
    // TODO create version, apply patch and do not push to master
    template.conflictResultVar.set({});
  },
  'click .conflict'(event, template) {
    console.log('click');
    var idElemClicked = $(event.currentTarget).attr('idelement');
    var whichBranch = $(event.currentTarget).attr('branch');
    console.log('uuuuuuu');
    console.log(conflictResolutionResult);
    conflictResolutionResult[idElemClicked] = this.get('data').conflicts[idElemClicked][whichBranch];
    template.conflictResultVar.set(conflictResolutionResult);
  }
});

Template.popupMerge.helpers({
  conflictResolutionCompleted() {
    // if (!JSON.stringify(this.get('data').conflicts)) {
    //   return {}
    // }
    if (this.get('data') && this.get('data').conflicts) {

      if (Object.keys(this.get('data').conflicts).length == 0) {
        return {}
      }
      console.log("NbElement from conflictResultVar");
      console.log(Object.keys(Template.instance().conflictResultVar.get()).length);
      console.log(Template.instance().conflictResultVar.get());
      console.log(Object.keys(this.get('data').conflicts).length);
      if (Object.keys(Template.instance().conflictResultVar.get()).length >= Object.keys(this.get('data').conflicts).length) {
        return {};
      }
      return {disabled:'disabled'};
    } else {
      return {disabled: 'disabled'};
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