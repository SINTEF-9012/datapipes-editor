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
      e.stopPropagation();
      
      var canvas = template.findParentTemplate('canvas');
      var svg = canvas.find('svg');
      var overlay = canvas.overlayPipeline;
      var port = template.find('.bigml-port');
      
      // Make a list of all available input ports
      var inputPorts = canvas.findAll('.bigml-inputport .bigml-port').map((port) => {
        return {
          x: parseInt(port.getAttribute('cx')),
          y: parseInt(port.getAttribute('cy')),
          data: Blaze.getData(port).port
        };
      });
      
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
      overlay.set({
        start: { x: port.getAttribute('cx'), y: port.getAttribute('cy') },
        end: { x: e.offsetX, y: e.offsetY },
        visible: true
      });
      
      // Move with mouse, and do something when we are done
      attachMouseMove(svg, function(e) {
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
        var start = Blaze.getData(port) ? Blaze.getData(port).port : undefined;
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