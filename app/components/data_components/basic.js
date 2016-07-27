/*
 * Copyright 2015 Nicolas Ferry <${email}>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  var bigml = joint.shapes.bigml = {};
  var mod = angular.module('bigmlEditor');
  
  mod.factory('bigmlComponents', function() {
    return {
      'root': [],
      'subgroups': []
    };
  });

  /*joint.shapes.bigml.toolElement = joint.shapes.basic.Generic.extend({
    toolMarkup: ['<button class="trigger"><i class="fa fa-expand"></i><i class="fa fa-compress"></i></button>'].join(''),
    defaults: joint.util.deepSupplement({
      attrs: {
        text: { 'font-weight': 400, 'font-size': 'small', fill: 'black', 'text-anchor': 'middle', 'ref-x': .5, 'ref-y': .5, 'y-alignment': 'middle' },
      },
    }, joint.shapes.basic.Generic.prototype.defaults)
  });*/

  /* Component element */
  bigml.Component = joint.shapes.devs.Model.extend({
    portMarkup: '<g class="port<%= id %>"><circle class="port-body"/></g>',

    addPort: function (port) {
        console.log('add');
        var arrayString = "";
        if (port.type === "in")
            arrayString = 'inPorts';
        else if (port.type === "out")
            arrayString = 'outPorts';
      var portsArray = this.get(arrayString) || [];
      this.set(arrayString, portsArray.concat([port.id]));
    },
    removePort: function (port) {
        var arrayString = "";
        console.log(port);
        console.log(port.type);
        if (port.type === "in")
            arrayString = 'inPorts';
        else if (port.type === "out")
            arrayString = 'outPorts';

        var portsArray = this.get(arrayString) || [];
        console.log(portsArray);
        var lg = portsArray.length;
        for (var i = 0; i < lg; ++i) {
            if (port.id === portsArray[i]) {
                if (lg === 1) {
                    this.set(arrayString, []);
                }
                console.log(i);
                portsArray.splice(i, 1);
                this.set(arrayString, portsArray);
            }
        }
    },

    defaults: joint.util.deepSupplement({
      type: 'bigml.Component',
      inPorts: [],
      outPorts: [],
      attrs: {
        '.inPorts circle': {
          r: 10,
          stroke: '#ccc',
          'stroke-width': 2,
          magnet: 'passive',
          type: 'input'
        },
        '.outPorts circle': {
          r: 10,
          stroke: '#ccc',
          'stroke-width': 2,
          magnet: true,
          type: 'output'
        }
      }
    }, joint.shapes.devs.Model.prototype.defaults),
    properties: [
      { name: 'Name', type: 'string', default: 'hello' }
    ]
  });


  bigml.ComponentView = joint.shapes.devs.ModelView;
  /* Data flow links */
  bigml.Dataflow = joint.dia.Link.extend({
    defaults: joint.util.deepSupplement({
        type: 'bigml.Dataflow',
        attrs: {
          '.marker-source': {
            d: ''
          },
          '.marker-target': {
            d: 'M 20 0 L 0 10 L 20 20 z'
          }
        },
    }, joint.dia.Link.prototype.defaults)
  });


  /* Composite element */
  bigml.Composite = bigml.Component.extend({
    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

    defaults: joint.util.deepSupplement({
      type: 'bigml.Composite',
      inPorts: ['8080', '7070'],
      outPorts: ['out1'],
      size: { width: 200, height: 200 },
      originalSize: {width: 200, height:200},
      attrs: {
        'rect': {
          rx: 10,
          ry: 10,
          'stroke-dasharray': '5,5'
        },
        '.label': {
          text: 'Composite',
          'ref-y': -20
        }
      },
      // constructor to have an individual properties array (else it's shared)
      constructor : function() {
        bigml.Composite.__super__.constructor.apply(this);
        this.properties = [
          {
            name: 'is Composite',
            description: 'Should the element contains elements',
            type: 'boolean',
            value: true
          }
        ];
      },
    }, joint.shapes.bigml.Component.prototype.defaults)
  });



  bigml.CompositeView = joint.shapes.devs.ModelView;

  /* Add to components list for GUI */
  mod.decorator('bigmlComponents', ['$delegate', function(components) {
    components.subgroups.push({
      text: 'Basics',
      icon: '',
     elements: [
         {
             text:'Composite',
             icon:'',
             jointEl: bigml.Composite
         }
     ] 
    });
    return components;
  }]);
})();