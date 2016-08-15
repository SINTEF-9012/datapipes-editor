import { Template } from 'meteor/templating';
import { Class, Type } from 'meteor/jagi:astronomy';

import { Branch, Version } from '/imports/synchronization/version.js';
import { ComponentsList } from '/imports/components/list.js';
import { BigmlComponent } from '/imports/components/basic.js';

import { propertiesElement } from '/client/rightbar.js';
import { attachMouseMove } from '/client/utils.js';

/* Type to class mappings */
var typeClassMap = {};
ComponentsList.forEach((component) => {
  typeClassMap[component.className] = component;
});

Template.canvasElements.helpers({
  components() {
    if (this && this.lastVersion)
      return this.lastVersion().elements;
    else
      return [];
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
  /* --- Drag-drop new elements onto canvas --- */
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
        // Add component to current version
        this.elements.push(obj);
        this.save();
      }
    }
  },
  /* --- Moving components on the canvas --- */
  'mousedown g'(e, template) {
    e.preventDefault();
    
    var element = this;
    var svg = template.find('svg');

    var move = function(e) {
      element.location.x += e.movementX;
      element.location.y += e.movementY;
      element.save();
    };
    attachMouseMove(svg, move);
  },
  /* --- Removing components from the canvas --- */
  'dblclick' (e) {
    this.remove();
  },
  /* --- Show/hide the properties bar on the right side --- */
  'contextmenu g'(e, template) {
    e.preventDefault();
    propertiesElement.set(this);
    window.testElem = this;
  },
  'contextmenu'(e, template) {
    e.preventDefault();
    propertiesElement.set(undefined);
  }
});