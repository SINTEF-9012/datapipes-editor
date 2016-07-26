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
  bigml.Component = joint.shapes.basic.Rect.extend({
    defaults: joint.util.deepSupplement({
      type: 'bigml.Component'
    }, joint.shapes.basic.Rect.prototype.defaults),
    properties: [
      { name: 'Name', type: 'string', default: 'hello' }
    ]
  });
    
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
        }
    }, joint.dia.Link.prototype.defaults)
  });
  
  /* Composite element */
  bigml.Composite = bigml.Component.extend({
    defaults: joint.util.deepSupplement({
      type: 'bigml.Composite',
      size: { width: 250, height: 250 },
      originalSize: {width: 200, height:200},
      attrs: {
        'rect': {
          rx: 10,
          ry: 10,
          'stroke-dasharray': '5,5'
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
      }
    }, joint.shapes.basic.Rect.prototype.defaults)
  });


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