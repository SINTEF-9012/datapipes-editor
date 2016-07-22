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
      size: { width: 400, height: 300 },
      attrs: {
        'rect': {
          rx: 10,
          ry: 10,
          'stroke-dasharray': '5,5'
        }
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