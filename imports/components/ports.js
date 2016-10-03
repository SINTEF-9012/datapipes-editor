import { Template } from 'meteor/templating';

import { BigmlInputPort, BigmlOutputPort, BigmlPipeline } from '/imports/components/basic.js';

import { attachMouseMove } from '/client/utils.js';

Template.bigml_port.helpers({
  portPosition() {
    var pos = this.component.getPortPosition(this.port);
    return { cx: pos.x, cy: pos.y };
  }
});

Template.bigml_outputport.events({
  'mousedown'(e, template) {
    if (e.button == 0) { // Only react to left-clicks
      var canvas = template.findParentTemplate('editorcanvas'),
          port = this.port;
      
      // Is this an editable canvas?
      if (canvas) e.stopPropagation();
      else return;
      
      // Find possible input ports (not current component)
      var inputPorts = canvas.data.version.elements.components.filter(c => c._id._str != this.component._id._str && c.inputPorts && c.inputPorts.length).reduce((ports,c) => {
        return ports.concat(c.inputPorts.map(port => {
          var pos = c.getPortPosition(port);
          pos.data = port;
          return pos;
        }));
      },[]);
      
      // Function to find closest port (within a limit)
      var findClosestPort = function(e) {
        return inputPorts.reduce((prev,curr) => {
          var r = Math.sqrt(Math.pow(curr.x-e.offsetX,2)+Math.pow(curr.y-e.offsetY,2));
          if (r < 30) {
            curr.r = r;
            if (prev == undefined || prev.r > r)
              return curr;
          }
          return prev;
        }, undefined);
      };
      
      // Move overlay to current port position
      var overlay = template.findParentTemplate('canvas').overlayPipeline;
      overlay.set({
        start: this.component.getPortPosition(this.port),
        end: { x: e.offsetX, y: e.offsetY },
        visible: true
      });
      
      // Move with mouse, and do something when we are done
      attachMouseMove(canvas.find('svg'), function(e) {
        var nearby = findClosestPort(e);
        var pos = overlay.get();
        
        if (nearby) {
          pos.end.x = nearby.x;
          pos.end.y = nearby.y;
        } else {
          pos.end.x = e.offsetX;
          pos.end.y = e.offsetY;
        }
        overlay.set(pos);
      },function(e) {
        var pos = overlay.get();
        pos.visible = false;
        overlay.set(pos);
        
        // Add pipeline between these two ports
        var start = port;
        var end = findClosestPort(e) ? findClosestPort(e).data : undefined;
        
        if (start && end) {
          var pipe = new BigmlPipeline();
          pipe.outputPort = start;
          pipe.inputPort = end;
          
          canvas.data.version.elements.pipelines.push(pipe);
          canvas.data.version.save();
        }
      });
    }
  }
});