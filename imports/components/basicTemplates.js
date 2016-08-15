import { Template } from 'meteor/templating';

import { attachMouseMove } from '/client/utils.js';

var calcRectAttributes = function(location) {
  return {
    x: location.x-location.width/2,
    y: location.y-location.height/2,
    width: location.width,
    height: location.height
  }
};

Template['bigml.component'].helpers({
  svgAttributes() { return calcRectAttributes(this.location); }
});

Template['bigml.compositecomponent'].helpers({
  svgAttributes() { return calcRectAttributes(this.location); },
  resizeAttributes() {
    return {
      x: this.location.x+this.location.width/2-10,
      y: this.location.y+this.location.height/2-10,
      width: 20,
      height: 20
    }
  }
});
Template['bigml.compositecomponent'].events({
  'mousedown rect.resize'(e, template) {
    var parent = template.findParentTemplate('canvas');
    if (parent) {
      e.preventDefault();
      e.stopPropagation();

      var element = this;
      var svg = parent.find('svg');

      var resize = function(e) {
        element.location.width += e.movementX;
        element.location.height += e.movementY;

        if (element.location.width < 10)
          element.location.width = 10;
        else
          element.location.x += e.movementX/2;

        if (element.location.height < 10)
          element.location.height = 10;
        else
          element.location.y += e.movementY/2;
        
        element.save();
      };
      attachMouseMove(svg, resize);
    }
  },
  /*
  'mousedown rect.resize'(e, template) {
    e.stopPropagation();
    template.resizing = true;
    window.tempTemp = template;
    console.log(template);
    var parent = template.findParentTemplate('canvas');
    console.log(parent);
  },
  'mousemove'(e,template) {
    if (template.resizing) {
      this.location.x += e.originalEvent.movementX/2;
      this.location.y += e.originalEvent.movementY/2;
      this.location.width += e.originalEvent.movementX;
      this.location.height += e.originalEvent.movementY;
      this.save();
    }
  },
  'mouseup, mouseout'(e,template) {
    template.resizing = false;
    console.log('Stopped resizing');
  }
  */
});
/*
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
*/

Template['bigml.storagesystem'].helpers({
  svgAttributes() {
    return {
      cx: this.location.x,
      cy: this.location.y,
      r: (this.location.width+this.location.height)/4
    };
  }
});