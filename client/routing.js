import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/', {
  triggersEnter: [(context, redirect) => {
    redirect('/monitor/');
  }]
});

FlowRouter.route('/monitor/', {
  name: 'monitor',
  action() {
  }
});

FlowRouter.route('/editor/', {
  name: 'editor',
  action() {
  }
});

FlowRouter.route('/history/', {
  name: 'history',
  action() {
  }
});