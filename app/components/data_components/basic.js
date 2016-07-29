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
(function () {
    var bigml = joint.shapes.bigml = {};
    var mod = angular.module('bigmlEditor');

    mod.factory('bigmlComponents', function () {
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
            {name: 'Name', type: 'string', default: 'hello'}
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
            size: {width: 200, height: 200},
            originalSize: {width: 200, height: 200},
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
            constructor: function () {
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
        }, joint.shapes.bigml.Component.prototype.defaults)
    });

    bigml.CompositeView = joint.shapes.devs.ModelView;

    bigml.Process = bigml.Component.extend({
        markup: '<g class="rotatable"><g class="scalable body"><path d="m 1065.7143,670.93359 a 455.71429,455.71429 0 1 1 -911.42859,0 455.71429,455.71429 0 1 1 911.42859,0 z"' +
        ' transform="matrix(0.78080476,0,0,0.78080476,-100.57662,-7.2202643)" id="path3186" style="fill:#e5e5ff;fill-opacity:1;stroke:#646464;stroke-opacity:1" /> ' +
        '<g transform="translate(135.025,270.24432)" id="g3239"><g id="g3191"><g id="g3193"><path d="m 239.9,4.15 -24.5,10.1 c -13.1,5.4 -19.3,20.5 -13.9,33.5 l 6.3,15.2 c -12.3,9.1 -23,19.9 -32.2,32.2 l -15.2,-6.3 c -6.3,-2.6 -13.3,-2.6 -19.6,0 -6.3,2.6 -11.3,7.6 -13.9,13.9 l -10.2,24.5 c -5.4,13.1 0.8,28.1 13.9,33.5 l 22.5,9.3 c 5.1,2.1 10.8,-0.3 12.9,-5.4 2.1,-5.1 -0.3,-10.8 -5.4,-12.9 l -22.5,-9.3 c -3,-1.2 -4.4,-4.7 -3.2,-7.7 l 10.2,-24.5 c 0.6,-1.4 1.7,-2.6 3.2,-3.2 1.4,-0.6 3,-0.6 4.5,0 l 22.5,9.3 c 4.4,1.8 9.4,0.3 12,-3.6 10.1,-15.2 22.9,-28 38.1,-38.1 3.9,-2.6 5.5,-7.7 3.7,-12 l -9.3,-22.5 c -1.2,-3 0.2,-6.4 3.2,-7.7 l 24.5,-10.1 c 1.4,-0.6 3,-0.6 4.5,0 1.4,0.6 2.6,1.7 3.2,3.2 l 9.3,22.5 c 1.8,4.4 6.4,6.9 11.1,5.9 17.8,-3.6 36,-3.5 53.8,0 4.6,0.9 9.3,-1.6 11.1,-5.9 l 9.3,-22.5 c 1.2,-3 4.7,-4.4 7.7,-3.2 l 24.5,10.2 c 1.4,0.6 2.6,1.7 3.2,3.2 0.6,1.4 0.6,3 0,4.5 l -9.3,22.5 c -1.8,4.4 -0.3,9.4 3.6,12 15.2,10.1 28,22.9 38.1,38.1 2.6,3.9 7.7,5.5 12,3.7 l 22.5,-9.3 c 1.5,-0.6 3,-0.6 4.5,0 1.4,0.6 2.6,1.7 3.2,3.2 l 10.1,24.5 c 0.6,1.4 0.6,3 0,4.5 -0.6,1.4 -1.7,2.6 -3.2,3.2 l -22.5,9.3 c -4.4,1.8 -6.8,6.4 -5.9,11.1 3.6,17.8 3.5,36 0,53.8 -0.9,4.6 1.6,9.3 5.9,11.1 l 22.5,9.3 c 3,1.2 4.4,4.7 3.2,7.7 l -10.2,24.5 c -1.2,3 -4.7,4.4 -7.7,3.2 l -22.5,-9.3 c -4.4,-1.8 -9.4,-0.3 -12,3.6 -10.1,15.2 -22.9,28 -38.1,38.1 -3.9,2.6 -5.5,7.7 -3.7,12 l 9.3,22.5 c 0.6,1.4 0.6,3 0,4.5 -0.6,1.4 -1.7,2.6 -3.2,3.2 l -24.5,10.1 c -1.4,0.6 -3,0.6 -4.5,0 -1.4,-0.6 -2.6,-1.7 -3.2,-3.2 l -9.3,-22.5 c -2.1,-5.1 -7.9,-7.5 -12.9,-5.4 -5.1,2.1 -7.5,7.9 -5.4,12.9 l 9.3,22.5 c 2.6,6.3 7.6,11.3 13.9,13.9 3.2,1.3 6.5,2 9.8,2 3.3,0 6.7,-0.7 9.8,-2 l 24.5,-10.1 c 6.3,-2.6 11.3,-7.6 13.9,-13.9 2.6,-6.3 2.6,-13.3 0,-19.6 l -6.3,-15.2 c 12.3,-9.1 23,-19.9 32.2,-32.2 l 15.2,6.3 c 13.1,5.4 28.1,-0.8 33.5,-13.9 l 10.2,-24.5 c 5.4,-13.1 -0.8,-28.1 -13.9,-33.5 l -15.2,-6.3 c 2.2,-15.1 2.2,-30.4 0,-45.5 l 15.2,-6.3 c 6.3,-2.6 11.3,-7.6 13.9,-13.9 2.6,-6.3 2.6,-13.3 0,-19.6 l -10.1,-24.5 c -2.6,-6.3 -7.6,-11.3 -13.9,-13.9 -6.3,-2.6 -13.3,-2.6 -19.6,0 l -15.2,6.3 c -9.1,-12.3 -19.9,-23.1 -32.1,-32.2 l 6.3,-15.2 c 2.6,-6.3 2.6,-13.3 0,-19.6 -2.6,-6.3 -7.6,-11.3 -13.9,-13.9 L 365,4.15 c -13.1,-5.4 -28.1,0.8 -33.5,13.9 l -6.3,15.2 c -15.1,-2.2 -30.4,-2.2 -45.5,0 l -6.3,-15.2 c -2.6,-6.3 -7.6,-11.3 -13.9,-13.9 -6.3,-2.6 -13.3,-2.6 -19.6,0 z"' +
        ' id="path3195" style="fill:#2c2f33"/><path d="m 382.9,189.25 c -0.3,-44.2 -36.4,-79.9 -80.5,-79.9 -0.2,0 -0.4,0 -0.6,0 -21.5,0.2 -41.7,8.7 -56.8,24 -15.1,15.3 -23.3,35.6 -23.2,57.1 0,5.4 4.5,9.8 9.9,9.8 h 0.1 c 5.5,0 9.9,-4.5 9.8,-10 -0.1,-16.2 6.1,-31.5 17.5,-43.1 11.4,-11.6 26.6,-18 42.8,-18.1 0.1,0 0.3,0 0.4,0 33.3,0 60.5,27 60.7,60.3 0.2,33.5 -26.8,60.9 -60.3,61.2 -5.5,0 -9.9,4.5 -9.8,10 0,5.4 4.5,9.8 9.9,9.8 0,0 0,0 0.1,0 44.5,-0.3 80.3,-36.7 80,-81.1 z"' +
        ' id="path3197" style="fill:#2c2f33"/><path d="m 135.3,487.75 h 19.3 c 11.8,0 21.4,-9.6 21.4,-21.4 v -9.9 c 9.6,-2.6 18.8,-6.4 27.4,-11.4 l 7,7 c 4,4 9.4,6.3 15.1,6.3 5.7,0 11.1,-2.2 15.1,-6.3 l 13.6,-13.6 c 4,-4 6.3,-9.4 6.3,-15.1 0,-5.7 -2.2,-11.1 -6.3,-15.1 l -7,-7 c 5,-8.6 8.8,-17.8 11.4,-27.4 h 9.9 c 11.8,0 21.4,-9.6 21.4,-21.4 v -19.3 c 0,-11.8 -9.6,-21.4 -21.4,-21.4 h -9.9 c -2.6,-9.6 -6.4,-18.8 -11.4,-27.4 l 7,-7 c 4,-4 6.3,-9.4 6.3,-15.1 0,-5.7 -2.2,-11.1 -6.3,-15.1 l -13.6,-13.6 c -4,-4 -9.4,-6.3 -15.1,-6.3 -5.7,0 -11.1,2.2 -15.1,6.3 l -7,7 c -8.6,-5 -17.8,-8.8 -27.4,-11.4 v -9.9 c 0,-11.8 -9.6,-21.4 -21.4,-21.4 h -19.3 c -11.8,0 -21.4,9.6 -21.4,21.4 v 9.9 c -9.6,2.6 -18.8,6.4 -27.4,11.4 l -7,-7 c -4,-4 -9.4,-6.3 -15.1,-6.3 -5.7,0 -11.1,2.2 -15.1,6.3 l -13.6,13.6 c -8.3,8.3 -8.3,21.9 0,30.2 l 7,7 c -5,8.6 -8.8,17.8 -11.4,27.4 h -9.9 c -11.8,0 -21.4,9.6 -21.4,21.4 v 19.3 c 0,11.8 9.6,21.4 21.4,21.4 h 9.9 c 2.6,9.6 6.4,18.8 11.4,27.4 l -7,7 c -8.3,8.3 -8.3,21.9 0,30.2 l 13.6,13.6 c 4,4 9.4,6.3 15.1,6.3 5.7,0 11.1,-2.2 15.1,-6.3 l 7,-7 c 8.6,5 17.8,8.8 27.4,11.4 v 9.9 c 0.1,11.8 9.7,21.4 21.4,21.4 z m -44.7,-63.4 c -1.7,-1.1 -3.6,-1.7 -5.5,-1.7 -2.6,0 -5.1,1 -7,2.9 l -12.5,12.5 c -0.4,0.4 -0.8,0.5 -1.1,0.5 -0.3,0 -0.7,-0.1 -1.1,-0.5 l -13.6,-13.6 c -0.6,-0.6 -0.6,-1.6 0,-2.2 l 12.5,-12.5 c 3.3,-3.3 3.9,-8.6 1.2,-12.5 -7.2,-10.7 -12.1,-22.6 -14.6,-35.2 -0.9,-4.6 -5,-8 -9.7,-8 H 21.5 c -0.9,0 -1.6,-0.7 -1.6,-1.6 v -19.3 c 0,-0.9 0.7,-1.6 1.6,-1.6 h 17.7 c 4.7,0 8.8,-3.3 9.7,-8 2.5,-12.6 7.4,-24.5 14.6,-35.2 2.6,-3.9 2.1,-9.2 -1.2,-12.5 l -12.5,-12.5 c -0.6,-0.6 -0.6,-1.6 0,-2.2 l 13.6,-13.6 c 0.4,-0.4 0.8,-0.5 1.1,-0.5 0.3,0 0.7,0.1 1.1,0.5 l 12.5,12.7 c 3.3,3.3 8.6,3.9 12.5,1.2 10.7,-7.2 22.6,-12.1 35.2,-14.6 4.6,-0.9 8,-5 8,-9.7 v -17.7 c 0,-0.9 0.7,-1.6 1.6,-1.6 h 19.3 c 0.9,0 1.6,0.7 1.6,1.6 v 17.7 c 0,4.7 3.3,8.8 8,9.7 12.6,2.5 24.5,7.4 35.2,14.6 3.9,2.6 9.2,2.1 12.5,-1.2 l 12.5,-12.5 c 0.4,-0.4 0.8,-0.5 1.1,-0.5 0.3,0 0.7,0.1 1.1,0.5 l 13.6,13.6 c 0.4,0.4 0.5,0.8 0.5,1.1 0,0.3 -0.1,0.7 -0.5,1.1 l -12.5,12.5 c -3.3,3.3 -3.9,8.6 -1.2,12.5 7.2,10.7 12.1,22.6 14.6,35.2 0.9,4.6 5,8 9.7,8 h 17.7 c 0.9,0 1.6,0.7 1.6,1.6 v 19.3 c 0,0.9 -0.7,1.6 -1.6,1.6 h -17.7 c -4.7,0 -8.8,3.3 -9.7,8 -2.5,12.6 -7.4,24.5 -14.6,35.2 -2.6,3.9 -2.1,9.2 1.2,12.5 l 12.5,12.5 c 0.4,0.4 0.5,0.8 0.5,1.1 0,0.3 -0.1,0.7 -0.5,1.1 l -13.6,13.6 c -0.4,0.4 -0.8,0.5 -1.1,0.5 -0.3,0 -0.7,-0.1 -1.1,-0.5 L 212,425.75 c -3.3,-3.3 -8.6,-3.9 -12.5,-1.2 -10.7,7.2 -22.6,12.1 -35.2,14.6 -4.6,0.9 -8,5 -8,9.7 v 17.7 c 0,0.9 -0.7,1.6 -1.6,1.6 h -19.3 c -0.9,0 -1.6,-0.7 -1.6,-1.6 v -17.7 c 0,-4.7 -3.3,-8.8 -8,-9.7 -12.6,-2.7 -24.5,-7.6 -35.2,-14.8 z"' +
        ' id="path3199" style="fill:#3c92ca"/><path d="m 203.7,342.95 c 0,-32.4 -26.4,-58.8 -58.8,-58.8 -32.4,0 -58.7,26.4 -58.7,58.8 0,32.4 26.4,58.8 58.8,58.8 32.4,0 58.7,-26.4 58.7,-58.8 z m -97.7,0 c 0,-21.5 17.5,-39 39,-39 21.5,0 39,17.5 39,39 0,21.5 -17.5,39 -39,39 -21.5,0 -39,-17.6 -39,-39 z"' +
        ' id="path3201" style="fill:#3c92ca"/></g></g></g></g><g class="inPorts"/><g class="outPorts"/></g>',
        defaults: joint.util.deepSupplement({
            type: 'bigml.Process',
            inPorts: ['8080', '7070'],
            outPorts: ['out1'],
            size: {width: 70, height: 70}
        }, joint.shapes.bigml.Component.prototype.defaults)
    });

    bigml.ProcessView = joint.shapes.devs.ModelView;

    /* Add to components list for GUI */
    mod.decorator('bigmlComponents', ['$delegate', function (components) {
        components.subgroups.push({
            text: 'Basics',
            icon: '',
            elements: [
                {
                    text: 'Composite',
                    icon: '',
                    jointEl: bigml.Composite
                },
                {
                    text: 'Process',
                    icon: '',
                    jointEl: bigml.Process
                }
            ]
        });
        return components;
    }]);
})();