import { FlowRouter } from 'meteor/kadira:flow-router';

Template.leftbar.events({
  'click ul.nav>li>a'(event) {
    event.preventDefault();
    FlowRouter.go(event.target.getAttribute('href'));
  }
});