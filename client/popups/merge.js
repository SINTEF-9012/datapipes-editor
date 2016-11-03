import { Template } from 'meteor/templating';
import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js';

import { selectedBranch } from '/client/branch.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.popupMerge.onCreated(function() {
  this.conflictResultVar = new ReactiveVar({});
});

Template.popupMerge.events({
  'click div.conflict'(event, template) {
    var resolution = template.conflictResultVar.get();
    resolution[this.key] = this.branch;
    template.conflictResultVar.set(resolution);
  },
  'click button.merge-cancel'(event, template) {
    template.conflictResultVar.set({});
  },
  'click button.merge-continue'(event, template) {
    var conflicts = this.get('data'),
        resolution = template.conflictResultVar.get(),
        branch = Branch.findOne(selectedBranch.get());
    
    // Merge nonconflicting and resolved conflicting options into a new set of patches
    var patches = {};
    Object.keys(resolution).forEach(key => {
      if (resolution[key] == 'current')
        patches[key] = conflicts.conflicting[key][1];
      else if (resolution[key] == 'master')
        patches[key] = conflicts.conflicting[key][0];
    });
    
    // Try to pull changes in master with given conflict resolution patches
    var result = branch.pull(patches);
    
    this.set('data',undefined);
    template.conflictResultVar.set({})
    
    if (result === true) {
      // It worked, push master
      if (branch.push())
        selectedBranch.set('master');
    } else {
      // Something went wrong, try again
      this.set('data',result);
      event.stopImmediatePropagation();
    }
  },
  'click button, submit form'(event,template) {
    event.preventDefault();
    // Close dialog
    template.$('.modal').modal('hide');
  }
});

Template.popupMerge.helpers({
  conflicts() {
    var conflicts = this.get('data');
    if (conflicts && conflicts.conflicting)
      return Object.keys(conflicts.conflicting).map(key => { return { key: key, master: conflicts.conflicting[key][0], branch: conflicts.conflicting[key][1] }});
    else
      return [];
  },
  mergeButtonEnabled() {
    var popup = Template.instance(),
        resolution = popup.conflictResultVar.get(),
        conflicts = this.get('data');
    
    if (conflicts && conflicts.conflicting) {
      var allFixed = Object.keys(conflicts.conflicting).reduce((others,key) => others && key in resolution && !!resolution[key],true);
      if (allFixed) return {};
    }
    return { disabled: true };
  }
});

Template.popupMergeChoice.helpers({
  operation() {
    console.log(this);
    return this.changes[0].op;
  },
  conflictPanelClass() {
    var popup = Template.instance().findParentTemplate('popupMerge'),
        resolution = popup.conflictResultVar.get();
    
    if (this.key in resolution && resolution[this.key] == this.branch)
      return 'panel-success';
    if (this.key in resolution)
      return 'panel-danger';
    else
      return 'panel-default';
  }
});