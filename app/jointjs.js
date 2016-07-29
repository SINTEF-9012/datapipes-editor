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
          validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {

            // Prevent loop linking
            if (magnetS && magnetS.getAttribute('type') === 'input' && cellViewS.model.attributes.type !== 'bigml.Composite' ) return false;
            // Prevent linking from output ports to input ports within one element.
            if (cellViewS === cellViewT) return false;
            if (cellViewS.model.attributes.type === 'bigml.Composite') {

            }
            // Prevent linking to input ports.
            return (cellViewT.model.attributes.type === 'bigml.Composite') || (magnetT && magnetT.getAttribute('type') === 'input');
          },
          validateMagnet: function(cellView, magnet) {
            // Note that this is the default behaviour. Just showing it here for reference.
            // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
            return magnet.getAttribute('magnet') !== 'passive';
          },
          // Enable link snapping within 75px lookup radius
          snapLinks: { radius: 75 },
          defaultLink: new joint.shapes.bigml.Dataflow
        });
        $(scope.jointPaper.svg).css('background-color','white');

        scope.jointGraph.on('change:hidden', function(cell, changed,opt) {
          if (cell.get('hidden')) {
            // brinf it to back (to not be dragged)
            cell.toBack()
            // hide it (if it overflows a bit)
            cell.attr('./opacity', 0);
          }  else {
            // the opposite
            cell.toFront();
            cell.attr('./opacity', 1);
          }
        });

        scope.jointGraph.on('change:position', function(cell, newPosition, opt) {
          if (!isLink(cell)) {
            if (cell.get('embeds') && cell.get('embeds').length) {
              // If we're manipulating a parent element, let's store
              // it's original position to a special property so that
              // we can shrink the parent element back while manipulating
              // its children.

              cell.set('originalPosition', cell.get('position'));
            }
          }
        });
        // Right click on canvas
        scope.jointPaper.$el.on('contextmenu', function(e) {
          scope.hideProperties();
          e.preventDefault();
        });

        // Double click expand composite element targetted
        scope.jointPaper.on('cell:pointerdblclick', function(cellView,evt,x,y) {
          var cell = cellView.model;
          if ( cell.attributes.type === 'bigml.Composite') {
            // We change the status of the element on dblclick (simply : hide = !hide)
            // for each child
            var embeddedCells = cell.getEmbeddedCells();
            // for each child
            _.each(embeddedCells, function (child) {
              var isHidden = child.get('hidden');
              // we change its status (hidden = !hidden)
              child.set('hidden', !isHidden);
              var parentPosition = cell.get('position');
              // if the child is now not hidden, we calculate is position
              if (isHidden) {
                var currentPosition = {};
                var positionShift = child.get('shiftHiddenPosition');
                currentPosition.x = parentPosition.x + positionShift.x;
                currentPosition.y = parentPosition.y + positionShift.y;
                child.set('position', currentPosition);
              } else {
                var currentPosition = child.get('position');
                // we calculate our new position shift and store it
                var shiftPosition = {}
                shiftPosition.x =  currentPosition.x -parentPosition.x;
                shiftPosition.y = currentPosition.y - parentPosition.y;
                child.set('shiftHiddenPosition', shiftPosition);
                var parentSize = cell.get('size');
                var newPosition = {};
                var childSize = child.get('size');
                newPosition.x = (parentPosition.x + (parentSize.width / 2)) - (childSize.width / 2);
                newPosition.y = (parentPosition.y + (parentSize.height / 2)) - (childSize.height / 2);
                child.set('position', newPosition);
              }
            });

            // update the size of the parrent (expand if children are shown)
            updateSize(cell);


          }
        });
        function isLink(cell) {
          return cell.attributes.type === "bigml.Dataflow"
        }
        function updateSize(parent) {
          if (!parent.get('originalPosition')) parent.set('originalPosition', parent.get('position'));

          var originalPosition = parent.get('originalPosition');
          var originalSize = parent.get('originalSize');

          var newX = originalPosition.x;
          var newY = originalPosition.y;
          var newCornerX = originalPosition.x + originalSize.width;
          var newCornerY = originalPosition.y + originalSize.height;

          var embeddedCells = parent.getEmbeddedCells();
          _.each(embeddedCells, function (child) {
            if (!child.get('hidden')) {
              var childBbox = child.getBBox();
              if (childBbox.x < newX) {
                newX = childBbox.x;
              }
              if (childBbox.y < newY) {
                newY = childBbox.y;
              }
              if (childBbox.corner().x > newCornerX) {
                newCornerX = childBbox.corner().x;
              }
              if (childBbox.corner().y > newCornerY) {
                newCornerY = childBbox.corner().y;
              }
            }
          });
          parent.set({
            position: { x: newX, y: newY },
            size: { width: newCornerX - newX, height: newCornerY - newY }
          }, { skipParentHandler: true });
        }

        elem.on('dragover', function(e) {
          e.preventDefault();
        });
        
        elem.on('drop', function(e) {
          e.preventDefault();
          var jointEl = dragdrop.getJointjsElement(e.originalEvent.dataTransfer.getData('bigmlComponent'));

          // Creating jointJS element
          var el = new jointEl({});
          // init JointJS element property values with default values
          //for (var i =0; i < el.properties.length; ++i) {
          //  el.properties[i].value = ((el.properties[i].default) ? el.properties[i].default : null);
          //}

          // positioning element
          el.position( e.originalEvent.offsetX-el.attributes.size.width/2, e.originalEvent.offsetY-el.attributes.size.height/2 );

          console.log(e.originalEvent.offsetX-el.attributes.size.width/2);
          console.log(e.originalEvent.offsetY-el.attributes.size.height/2);

          // add element to graph
          scope.jointGraph.addCell(el);

          // Add right click listener
          el.findView(scope.jointPaper).$el.on('contextmenu', function(e) {
            scope.showProperties(el);
            e.preventDefault();
            e.stopPropagation();
          });
        });

        // Function to check if the click was on the border or not
        // elem is the element clicked, x and y the position of the click
        // and strokeWidth the width of the border
        function isBorderClicked(elem, x, y, strokeWidth) {
          var position = elem.get('position');
          var size = elem.get('size');
          // we check first x
          // so has to be x <= ourClick <= x + strokewidth
          // or
          // x + width - stokewidth < ourclick < x + width
          var checkX = (position.x <= x && x <= position.x+strokeWidth) || (position.x + size.width - strokeWidth <= x && x <= position.x + size.width);

          // then we do the same for Y
          var checkY = (position.y <= y && y <= position.y+strokeWidth) || (position.y + size.height - strokeWidth <= y && y <= position.y + size.height);

          return (checkX || checkY);
        }


        scope.jointPaper.on('cell:pointerdown', function (cellView, evt, x, y) {
          var cell = cellView.model;
          // if we didn't clicked on a link
          if (!isLink(cell)) {
            if (!cell.get('embeds') || cell.get('embeds').length === 0) {
              // Show the dragged element above all the other cells (except when the
              // element is a parent).
              cell.toFront();
            }

            if (cell.get('parent')) {
              scope.jointGraph.getCell(cell.get('parent')).unembed(cell);
            }
            // first we get the width of the border
            var strokeWidth = cell.attr('rect/stroke-dasharray') || 1;
            // then we check if we didn't click on a link and if we clicked on the border or not
            if (isBorderClicked(cell, x, y, parseFloat(strokeWidth)+ 10.0)) {
              var size = cell.get('size');
              cell.resize(size.width + 20, size.height + 20);
            }
          }
        });

        scope.jointPaper.on('cell:pointerup', function (cellView, evt, x, y) {
          var cell = cellView.model;
          // If it is not a link, it's an element
          if( !isLink(cell)) {
            var cellViewsBelow = scope.jointPaper.findViewsFromPoint(cell.getBBox().center());
            if (cellViewsBelow.length) {
              // Note that the findViewsFromPoint() returns the view for the `cell` itself.
              var cellViewBelow = _.find(cellViewsBelow, function (c) {
                return (c.model.id !== cell.id) && (c.model.attributes.type === 'bigml.Composite'); //&& (c.attributes.attr.type === 'bigml.Composite');
              });
              // Prevent recursive embedding.
              if (cellViewBelow && cellViewBelow.model.get('parent') !== cell.id) {
                var children = cellViewBelow.model.getEmbeddedCells();
                if (children.length != 0 && children[0].get('hidden') === true) {
                  cell.set('hidden', true);
                }
                cellViewBelow.model.embed(cell);
              }
            }
          }

        });
      }
    };
  }]);
  
})();