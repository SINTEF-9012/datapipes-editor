(function() {
  var bigml = joint.shapes.bigml;
  var mod = angular.module('bigmlEditor');
  
    /* Generic Queue icon */
  bigml.Queue = bigml.Component.extend({
    markup: '<g class="rotatable"><g class="scalable"><path d="M 0,66.66667 0,0 l 66.666666,0 33.33333,33.33333 0,66.66667 -66.666664,0 z"/><path class="front" d="m 100,33.333333 -66.666667,0 0,66.666667 L 100,100 100,33.333333 Z M 83.333333,16.666667 83.333333,25 25,25 l 0,58.333333 -8.333333,0 0,-66.666666 66.666666,0 z M 66.666667,0 l 0,8.333333 -58.333334,0 0,58.333334 L 0,66.666667 0,0 66.666667,0 Z" transform="translate(20,0)"/><image x="56" y="56" width="64" height="64"></image></g><circle class="input" /><circle class="output" /></g>',
    defaults: joint.util.deepSupplement({
      type: 'bigml.Database',
      size: { width: 120, height: 120 },
      attrs: {
        'path.front': {
          fill: '#666'
        },
        'circle.output': {
          r: 10,
          cx: 140,
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
    }, joint.shapes.basic.Rect.prototype.defaults)
  });
  
  /* Kafka */
  bigml.Kafka = bigml.Queue.extend({
    defaults: joint.util.deepSupplement({
      type: 'bigml.Kafka',
      attrs: {
        image: {
          'xlink:href': 'assets/img/kafka.png'
        }
      }
    }, bigml.Queue.prototype.defaults)
  });
    
  /* Add to components list for GUI */
  mod.decorator('bigmlComponents', ['$delegate', function(components) {
    components.subgroups.push({
      text: 'Queues',
      icon: '',
      elements: [
        {
          text: 'Kafka',
          icon: 'assets/img/kafka.png',
          jointEl: bigml.Kafka
        }
      ]
    });
    return components;
  }]);
})();