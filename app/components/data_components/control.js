(function () {
    var bigml = joint.shapes.bigml;
    var mod = angular.module('bigmlEditor');


    /* Generic Control */
    bigml.Control = bigml.Component.extend({
        markup: '<g class="rotatable"><g class="scalable"><rect width="10" height="300" style="fill:rgb(0,0,0);stroke-width:3;stroke:rgb(0,0,0)" /><image x="36" y="56" width="64" height="64"></image></g><circle class="input" /><circle class="output" /></g>',
        defaults: joint.util.deepSupplement({
            type: 'bigml.Control',
            size: {
                width: 3,
                height: 120
            },
            attrs: {
                'path.front': {
                    fill: '#666'
                },
                'circle.output': {
                    r: 5,
                    cx: 13,
                    cy: 20,
                    stroke: '#ccc',
                    'stroke-width': 2,
                    port: 'out',
                    magnet: true
                },
                'circle.input': {
                    r: 5,
                    cx: -10,
                    cy: 20,
                    stroke: '#ccc',
                    'stroke-width': 2,
                    port: 'in',
                    magnet: 'passive'
                }
            }
        }, joint.shapes.basic.Rect.prototype.defaults),
        properties: [
            {
                name: 'URL'
            }
    ]
    });

    /* Join Component */
    bigml.Join = bigml.Control.extend({
        defaults: joint.util.deepSupplement({
            type: 'bigml.Join',
            attrs: {
                image: {
                    'xlink:href': ''
                }
            }
        }, bigml.Control.prototype.defaults)
    });

    /* Fork Component */
    bigml.Fork = bigml.Control.extend({
        defaults: joint.util.deepSupplement({
            type: 'bigml.Fork',
            attrs: {
                image: {
                    'xlink:href': ''
                }
            }
        }, bigml.Control.prototype.defaults)
    });


    /* Add to components list for GUI */
    mod.decorator('bigmlComponents', ['$delegate', function (components) {
        components.subgroups.push({
            text: 'Control',
            icon: '',
            elements: [
                {
                    text: 'Join',
                    icon: '',
                    jointEl: bigml.Join
        },
                {
                    text: 'Fork',
                    icon: '',
                    jointEl: bigml.Fork
        }
      ]
        });
        return components;
  }]);

})();