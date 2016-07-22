(function() {
  var app = angular.module('bigmlEditor');
  
  app.factory('jointjsDragDrop', ['bigmlComponents', function(components) {
    var dragMap = 
      _.zipObject(
        _.map(
          _.flattenDeep([components.root, _.map(components.subgroups, function(sg) { return sg.elements; })]),
          function(comp) {
            comp.dragId = comp.jointEl.prototype.defaults.type;
            return [ comp.dragId, comp.jointEl ];
          }
        )
      );
    var iconPaper;

    return {
      getJointjsElement: function(dragId) {
        return dragMap[dragId];
      },
      
      getIconElement: function(dragId) {
        if (iconPaper) {
          iconPaper.model.clear();
          
          var el = new dragMap[dragId]; 
          el.position(iconPaper.$el.width()/2,iconPaper.$el.height()/2);
          iconPaper.model.addCell(el);
          
          return { 
            icon: iconPaper.svg,
            xOffset: el.attributes.size.width/2+iconPaper.$el.width()/2,
            yOffset: el.attributes.size.height/2+iconPaper.$el.height()/2
          }
        }
      },
      
      setIconPaper: function(paper) {
        if (iconPaper) iconPaper.remove();
        iconPaper = paper;
      }
    };
  }]);
  
  
  app.directive('jointjsEditor', ['jointjsDragDrop', function(dragdrop) {
    return {
      link: function(scope, elem) {    
        /* Drag-drop rendering paper */
        dragdrop.setIconPaper(new joint.dia.Paper({
          el: elem,
          model: new joint.dia.Graph(),
          gridSize: 1,
          width: '100%',
          height: '100%',

        }));
        
        /* Actual editing paper */
        scope.jointPaper = new joint.dia.Paper({
          el: elem,
          model: scope.jointGraph,
          gridSize: 1,
          width: '100%',
          height: '100%',
          snapLinks: true,
          validateConnection: function(cellS, magnetS, cellT, magnetT) {
            // Needs to connect magnets together, and not with itself
            if (!magnetS || !magnetT || magnetS === magnetT) return false;

            // Don't allow connections to same element
            if (cellS === cellT) return false;

            // Only allow output->input ports
            if (magnetS.getAttribute('port') != 'out' || magnetT.getAttribute('port') != 'in') return false;

            // This should be OK
            return true;
          },
          defaultLink: new joint.shapes.bigml.Dataflow
        });
        $(scope.jointPaper.svg).css('background-color','white');

        // Right click on canvas
        scope.jointPaper.$el.on('contextmenu', function(e) {
          scope.hideProperties();
          e.preventDefault();
        });


        elem.on('dragover', function(e) {
          e.preventDefault();
        });

        
        elem.on('drop', function(e) {
          var jointEl = dragdrop.getJointjsElement(e.originalEvent.dataTransfer.getData('bigmlComponent'));

          // Creating jointJS element
          var el = new jointEl({});
          console.log(el);
          // init JointJS element property values with default values
          //for (var i =0; i < el.properties.length; ++i) {
          //  el.properties[i].value = ((el.properties[i].default) ? el.properties[i].default : null);
          //}

          // positioning element
          el.position( e.originalEvent.offsetX-el.attributes.size.width/2, e.originalEvent.offsetY-el.attributes.size.height/2 );

          // add element to graph
          scope.jointGraph.addCell(el);

          // Add right click listener
          el.findView(scope.jointPaper).$el.on('contextmenu', function(e) {
            scope.showProperties(el);
            e.preventDefault();
            e.stopPropagation();
          });
        });
      }
    };
  }]);
  
})();