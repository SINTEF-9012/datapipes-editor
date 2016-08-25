import { FlowRouter } from 'meteor/kadira:flow-router';
import { Blaze } from 'meteor/blaze';

import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js'
import { selectedBranch } from '/client/branch.js';

import { PopupShow } from '/client/popups/popups.js';

var dateFormat = require('dateformat');
Template.leftbar.events({
  'click ul.nav>li>a'(event) {
    event.preventDefault();
    FlowRouter.go(event.target.getAttribute('href'));
  },
  'change select'(event,template) {
    selectedBranch.set(template.find('select').value);
  },
  'click button.new'(event) {
    PopupShow('newbranch');
  },
  'click button.save'(event) {
    Branch.findOne(selectedBranch.get()).commit();
  },
  'click .merge'(event) {
    let conflicts = Branch.findOne(selectedBranch.get()).pull();
    PopupShow('merge', conflicts);
  },
  'click .rollback'(event) {
    var idVersionClicked = $(event.currentTarget).attr('idversion');
    selectedBranch.get() ? selectedBranch.get().rollback(idVersionClicked) : Branch.getMasterBranch().rollback(idVersionClicked);
  }
});

Template.leftbar.helpers({
  branches() {
    return Branch.getUserBranches();
  },
  selectedBranch() {
    return selectedBranch.get();
  },
  isSelectedBranch(branch) {
    if (selectedBranch.get() == undefined)
      return branch._id == 'master';
    else
      return selectedBranch.get() == branch._id;
  },
  versions() {
      return selectedBranch.get() ? selectedBranch.get().versions : Branch.getMasterBranch().versions
  },
  formatDate(timestamp) {
    return dateFormat(timestamp, "isoDateTime");
  }
});

Template.mainarea.helpers({
  masterHead() {
    return Branch.getMasterHead();
  },
  currentHead() {
    var branch = Branch.findOne(selectedBranch.get());
    if (branch)
      return branch.lastVersion();
  }
});