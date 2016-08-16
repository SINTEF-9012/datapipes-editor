import { FlowRouter } from 'meteor/kadira:flow-router';

import { Branch, Version } from '/imports/synchronization/version.js';

Template.leftbar.events({
  'click ul.nav>li>a'(event) {
    event.preventDefault();
    FlowRouter.go(event.target.getAttribute('href'));
  },
  'click #button-create-new-branch'(event) {
      event.preventDefault();
      Branch.createNewBranch();
  }
});

Template.mainarea.helpers({
  masterHead() {
    return Branch.getMasterHead();
  }
});