import { Template } from 'meteor/templating';
import { Class, Type } from 'meteor/jagi:astronomy';

import { ComponentsList } from '/imports/components/list.js';
import { BigmlComponent } from '/imports/components/basic.js';

/* Type to class mappings */
var typeClassMap = {};
ComponentsList.forEach((component) => {
  typeClassMap[component.className] = component;
});

Template.canvas.helpers({
  components() { // Monitoring mode components
    return BigmlComponent.find();
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


Template.editorcanvas.events({
  'dragover'(event) {
    event.preventDefault();
  },
  'drop'(event) {
    event.preventDefault();
    var type = event.originalEvent.dataTransfer.getData('bigmlcomponent');
    if (type && typeClassMap[type]) {
      // Create a new type, and store it in the DB
      var obj = new typeClassMap[type]();
      if (obj instanceof BigmlComponent) {
        // Set position of element on canvas
        obj.location.x = event.originalEvent.offsetX;
        obj.location.y = event.originalEvent.offsetY;
        obj.save();
      }
    }
  },
  'mousedown g'(e, template) {
    template.dragging = this;
  },
  'mousemove'(event,template) {
    if (template.dragging) {
      template.dragging.location.x += event.originalEvent.movementX;
      template.dragging.location.y += event.originalEvent.movementY;
      template.dragging.save();
    }
  },
  'mouseup'(e,template) {
    template.dragging = null;
  },
  'dblclick' (e) {
    this.remove();
  }
});