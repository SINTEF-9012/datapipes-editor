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
  var bigml = joint.shapes.bigml;
  var mod = angular.module('bigmlEditor');
  
  /* Generic Database icon */
  bigml.Database = bigml.Component.extend({
    markup: '<g class="rotatable"><g class="scalable"><path d="m 91.666836,85.470828 c 0,8.020836 -19.39584,14.529166 -41.66667,14.529166 -22.26667,0 -41.666666,-6.50833 -41.666666,-14.529166 l 0,-70.937495 C 8.3335,6.508333 27.733496,0 50.000166,0 c 22.27083,0 41.66667,6.508333 41.66667,14.533333 z"/><path class="front" d="m 91.666834,75.229167 0,10.241666 C 91.666834,93.491667 72.271,100 50.000167,100 27.7335,100 8.3335,93.491667 8.3335,85.470833 l 0,-10.241666 c 10.075,7.241666 29.1875,9.4 41.666667,9.4 12.525,0 31.616667,-2.179167 41.666667,-9.4 z M 50.000167,61.025 c -12.525,0 -31.616667,-2.179167 -41.666667,-9.4 l 0,10.141667 c 0,8.025 19.4,14.529166 41.666667,14.529166 22.270833,0 41.666667,-6.508333 41.666667,-14.529166 l 0,-10.141667 c -10.075,7.241667 -29.1875,9.4 -41.666667,9.4 z m 0,-61.025 C 27.7335,0 8.3335,6.508333 8.3335,14.533333 c 0,8.025 19.4,14.529167 41.666667,14.529167 22.270833,0 41.666667,-6.508333 41.666667,-14.529167 C 91.666834,6.508333 72.271,0 50.000167,0 Z m 0,37.395833 c -12.525,0 -31.616667,-2.179166 -41.666667,-9.4 l 0,10.166667 c 0,8.025 19.4,14.529167 41.666667,14.529167 22.270833,0 41.666667,-6.508334 41.666667,-14.529167 l 0,-10.166667 c -10.075,7.241667 -29.1875,9.4 -41.666667,9.4 z"/><image x="36" y="56" width="64" height="64"></image></g><circle class="input" /><circle class="output" /></g>',
    defaults: joint.util.deepSupplement({
      type: 'bigml.Database',
      size: { width: 92, height: 120 },
      attrs: {
        'path.front': {
          fill: '#666'
        },
        'circle.output': {
          r: 10,
          cx: 120,
          cy: 50,
          stroke: '#ccc',
          'stroke-width': 2,
          port: 'out',
          magnet: true
        },
          'circle.input': {
          r: 10,
          cx: 0,
          cy: 50,
          stroke: '#ccc',
          'stroke-width': 2,
          port: 'in',
          magnet: 'passive'
        }
      }
    }, joint.shapes.basic.Rect.prototype.defaults),
    constructor : function() {
      bigml.Database.__super__.constructor.apply(this);
      this.properties = [
        {name: 'URL', type: 'url', default: 'localhost:8080'},
        {name: 'Authentication', type: 'string'},
        {name: 'Table', type: 'string'}
      ];
    }
  });
  

  /* CouchDB */
  bigml.CouchDB = bigml.Database.extend({
    defaults: joint.util.deepSupplement({
      type: 'bigml.CouchDB',
      attrs: {
        image: {
          'xlink:href': 'assets/img/couchdb.png'
        }
      }
    }, bigml.Database.prototype.defaults)
  });
  
  /* MongoDB */
  bigml.MongoDB = bigml.Database.extend({
    defaults: joint.util.deepSupplement({
      type: 'bigml.MongoDB',
      attrs: {
        image: {
          'xlink:href': 'assets/img/mongodb.png'
        }
      }
    }, bigml.Database.prototype.defaults)
  });
  
  /* Add to components list for GUI */
  mod.decorator('bigmlComponents', ['$delegate', function(components) {
    components.subgroups.push({
      text: 'Databases',
      icon: '',
      elements: [
        {
          text: 'CouchDB',
          icon: 'assets/img/couchdb.png',
          jointEl: bigml.CouchDB
        },
        {
          text: 'MongoDB',
          icon: 'assets/img/mongodb.png',
          jointEl: bigml.MongoDB
        }
      ]
    });
    return components;
  }]);
})();
/*
        type: 'logic.Gate11',
        attrs: {
            '.input': { ref: '.body', 'ref-x': -2, 'ref-y': 0.5, magnet: 'passive', port: 'in' },
            '.output': { ref: '.body', 'ref-dx': 2, 'ref-y': 0.5, magnet: true, port: 'out' }
        }
*/