import { Template } from 'meteor/templating';
import { Local } from '/imports/datastore.js';
import { Class, Type } from 'meteor/jagi:astronomy';

import ComponentsList from '/imports/components/list.js';
import { BigmlComponent } from '/imports/components/basic.js';

import { Elements } from '/imports/datastore.js';

window.BigmlComponent = BigmlComponent;

Template.canvasMonitor.helpers({
  components() { // Monitoring mode components
    return Elements.find();
  },
  getTemplateName() {
    var type = Type.types[this.type];
    // Loop trough inheritance-chain to find a template to render
    while (type instanceof Type && !(Template[type.name] instanceof Template))
      type = Type.types[type.class.parentClassName];
    
    if (Template[type.name] instanceof Template)
      return type.name;
    else
      return undefined;
  }
});

Template.canvasMonitor.events({
  'dragover'(event) {
    event.preventDefault();
  },
  'drop'(event) {
    event.preventDefault();
  },
  'drag'(event) {
    event.preventDefault();
  }
});