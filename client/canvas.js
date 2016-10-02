import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Class, Type } from 'meteor/jagi:astronomy';

import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js'

import { ComponentsList } from '/imports/components/list.js';
import { BigmlComponent, BigmlCompositeComponent, BigmlDatamodel } from '/imports/components/basic.js';

import { propertiesElement } from '/client/rightbar.js';
import { attachMouseMove } from '/client/utils.js';

/* Type to class mappings */
var typeClassMap = {};
ComponentsList.forEach((component) => {
  typeClassMap[component.className] = component;
});

Template.registerHelper('getBigmlComponentTemplate', function() {
  var type = Type.types[this.type];
  // Loop trough inheritance-chain to find a template to render
  while (type instanceof Type && !(Template[type.name] instanceof Template))
    type = Type.types[type.class.parentClassName];

  if (Template[type.name] instanceof Template)
    return type.name;
  else
    return undefined;
});

Template.canvasElements.helpers({
  getElements: function() {
    if (this.elements)
      return this.elements.getElements();
  },
  getPipelines: function() {
    if (this.elements)
      return this.elements.pipelines;
  }
});

Template.canvas.onCreated(function() {
  this.overlayPipeline = new ReactiveVar({
    start: { x: 100, y: 100 },
    end: { x: 200, y: 200},
    visible: false
  });
});
Template.canvas.helpers({
  overlayPipeline() { return Template.instance().overlayPipeline; }
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
      // Where was it dropped?
      if ((this.version && this.version instanceof Version) || this instanceof BigmlCompositeComponent) {
        // Create a new type, and store it in the DB
        var obj = new typeClassMap[type]();
        if (obj instanceof BigmlComponent) {
          // Set position of element on canvas
          obj.location.x = event.originalEvent.offsetX;
          obj.location.y = event.originalEvent.offsetY;
          // Add component to current version/composite
          if (this instanceof BigmlCompositeComponent) {
            this.children.push(obj);
            this.save();
          } else if (this.version instanceof Version) {
            this.version.elements.addElement(obj);
            this.version.save();
          }
        }
      }
    }
  },
  /* --- Moving components on the canvas --- */
  'mousedown g.bigml-component'(e, template) {
    e.preventDefault();
    e.stopPropagation();
    
    var element = this;
    var svg = template.find('svg');
    
    var moveList = [element];

    // Also move children for composite elements
    // TODO: All this Composite stuff is quite hack-ish, is there a better way perhaps? Like setting position relative to the parent??
    if (element instanceof BigmlCompositeComponent)
      element.children.forEach(c => {
        moveList.push(c);
      });
      
    var move = function(e) {
      moveList.forEach(element => {
        element.location.x += e.movementX;
        element.location.y += e.movementY;
      });
      element.save(); // One save is enough
    };
    attachMouseMove(svg, move);
  },
  /* --- Removing components from the canvas --- */
  'dblclick g.bigml-component' (e) {
    var parent = this.parent();
    if (parent instanceof Version || parent instanceof BigmlCompositeComponent) {
      var list;
      if (parent instanceof Version)
        list = parent.elements.getElements();
      else if (parent instanceof BigmlCompositeComponent)
        list = parent.children;
      
      var i = list.indexOf(this);
      if (i >= 0) {
        list.splice(i,1);
        parent.save();
      }
    }
  },
  'dblclick g.bigml-pipeline' (e) {
    console.log('Remove:', this);
  },
  /* --- Show/hide the properties bar on the right side --- */
  'contextmenu g.bigml-component'(e, template) {
    e.preventDefault();
    propertiesElement.set(this);
    window.testElem = this;
  },
  'contextmenu'(e, template) {
    e.preventDefault();
    propertiesElement.set(undefined);
  }
});
