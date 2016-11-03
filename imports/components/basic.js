import { Class } from 'meteor/jagi:astronomy';
import { Mongo } from 'meteor/mongo';

if (Meteor.isClient) {
  import '/imports/components/basicTemplates.html'
  import '/imports/components/basicTemplates.js';
  import '/imports/components/ports.html'
  import '/imports/components/ports.js';
  import '/imports/components/pipelines.html'
  import '/imports/components/pipelines.js';
}


const BigmlProperty = Class.create({
  name: 'bigml.property',
  fields: {
    value: {
      type: String
    }
  }
});

const BigmlElement = Class.create({
  name: 'bigml.element',
  typeField: 'type',
  secured: false,
  fields: {
    '_id': {
      type: Mongo.ObjectID,
      default() {
        return new Mongo.ObjectID();
      }
    },
    name: {
      type: String,
      default: ''
    },
    properties: {
      type: [BigmlProperty],
      default() { return []; }
    }
  },
  methods: {
    parent() {
      return this._parent;
    }
  },
  events: {
    afterInit(e) {
      e.target.save = function() {
        if (!this._parent)
          console.error('save(): No parent set!');
        this._parent.save();
      };
    }
  }
});

const BigmlPort = BigmlElement.inherit({
  name: 'bigml.port',
  fields: {
    format: {
      type: String,
      default: ''
    },
    protocol: {
      type: String,
      default: ''
    },
    schema: {
      type: String,
      default: ''
    },
    portNumber: {
      type: String,
      default: ''
    }
  }
});

const BigmlInputPort = BigmlPort.inherit({
  name: 'bigml.inputport',
  fields: {
    isMandatory: {
      type: Boolean,
      default: false
    }
  }
});

const BigmlOutputPort = BigmlPort.inherit({
  name: 'bigml.outputport'
});

const BigmlLocation = Class.create({
  name: 'bigml.location',
  fields: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 100
    },
    height: {
      type: Number,
      default: 100
    }
  }
});

const BigmlComponent = BigmlElement.inherit({
  name: 'bigml.component',
  fields: {
    login: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    },
    IPAddress: {
      type: String,
      default: ''
    },
    outputPorts: {
      type: [BigmlOutputPort],
      default() { return []; }
    },
    location: {
      type: BigmlLocation,
      default() { return new BigmlLocation(); }
    }
  },
  methods: {
    getPortPosition(port) {
      if (port instanceof BigmlOutputPort) {
        var ind = this.outputPorts.findIndex(p => p._id._str == port._id._str); // Some strange bug seems to re-create new objects in memory while moving
        if (ind >= 0) {
          return {
            x: this.location.x + this.location.width/2,
            y: this.location.y - this.location.height/2 + this.location.height/(this.outputPorts.length+1)*(ind+1)
          }
        }
      }
    }
  }
});

const BigmlManagedComponent = BigmlComponent.inherit({
  name: 'bigml.managedcomponent',
  fields: {
    inputPorts: {
      type: [BigmlInputPort],
      default() { return []; }
    }
  },
  methods: {
    getPortPosition(port) {
      if (port instanceof BigmlOutputPort) {
        return BigmlComponent.prototype.getPortPosition.call(this,port);
      } else if (port instanceof BigmlInputPort) {
        var ind = this.inputPorts.findIndex(p => p._id._str == port._id._str); // Some strange bug seems to re-create new objects in memory while moving
        if (ind >= 0) {
          return {
            x: this.location.x - this.location.width/2,
            y: this.location.y - this.location.height/2 + this.location.height/(this.inputPorts.length+1)*(ind+1)
          }
        }
      }
    }
  }
});

const BigmlCompositeComponent = BigmlManagedComponent.inherit({
  name: 'bigml.compositecomponent',
  fields: {
    children: {
      type: [BigmlManagedComponent],
      default() { return []; }
    }
  },
  events: {
    afterInit(e) {
      e.target.children.forEach(c => {
        c._parent = e.target;
      });
    }
  }
});

const BigmlOutsourcedComponent = BigmlComponent.inherit({
  name: 'bigml.outsourcedcomponent'
});

const BigmlPipeline = BigmlElement.inherit({
  name: 'bigml.pipeline',
  fields: {
    frequency: {
      type: String,
      default: ''
    },
    volume: {
      type: String,
      default: ''
    },
    outputPort: {
      type: BigmlOutputPort
    },
    inputPort: {
      type: BigmlInputPort
    }
  }
});

const BigmlDatamodel = BigmlElement.inherit({
  name: 'bigml.datamodel',
  fields: {
    components: {
      type: [BigmlComponent],
      default() { return []; }
    },
    pipelines: {
      type: [BigmlPipeline],
      default() { return []; }
    }
  },
  methods: {
    getElements: function() {
      return this.components;
    },
    addElement: function(obj) {
      this.components.push(obj);
    }
  }
});

/* -- Some more specific base types -- */
const BigmlDataprocessor = BigmlManagedComponent.inherit({
  name: 'bigml.dataprocessor',
  fields: {
    inputPorts: {
      type: [BigmlInputPort],
      default() {
        return [ new BigmlInputPort() ];
      }
    },
    outputPorts: {
      type: [BigmlOutputPort],
      default() {
        return [ new BigmlOutputPort() ];
      }
    }
  }
});

const BigmlStoragesystem = BigmlManagedComponent.inherit({
  name: 'bigml.storagesystem',
  fields: {
    inputPorts: {
      type: [BigmlInputPort],
      default() {
        return [ new BigmlInputPort() ];
      }
    }
  }
});

const BigmlDatasource = BigmlManagedComponent.inherit({
  name: 'bigml.datasource',
  fields: {
    outputPorts: {
      type: [BigmlOutputPort],
      default() {
        return [ new BigmlOutputPort() ];
      }
    }
  }
});

const BigmlDatavisualizer = BigmlManagedComponent.inherit({
  name: 'bigml.datavisualizer'
});

const BigmlMessagequeue = BigmlManagedComponent.inherit({
  name: 'bigml.messagequeue'
});

const BigmlControlflowcomponent = BigmlManagedComponent.inherit({
  name: 'bigml.controlflowcomponent'
});


export { BigmlProperty, BigmlElement, BigmlPort, BigmlInputPort, BigmlOutputPort, BigmlComponent, BigmlManagedComponent, BigmlCompositeComponent, BigmlOutsourcedComponent, BigmlPipeline, BigmlDatamodel, BigmlDataprocessor, BigmlStoragesystem, BigmlDatasource, BigmlDatavisualizer, BigmlMessagequeue, BigmlControlflowcomponent };
