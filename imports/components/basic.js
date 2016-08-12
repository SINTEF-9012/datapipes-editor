import { Class } from 'meteor/jagi:astronomy';
import { Local } from '/imports/datastore.js';

if (Meteor.isClient) {
  import '/imports/components/basicTemplates.html'
  import '/imports/components/basicTemplates.js';
}


const BigmlProperty = Class.create({
  name: 'bigml.property',
  fields: {
    value: {
      type: String
    }
  }
});
/*
const canvas = Class.create({
  name:'canvas',
  fields: {
    objets: {
      type: [BigmlGraphic],
      default() {
        return [];
      }
    }
  }
})

const BigmlGraphic = Class.create({
  name: 'assoc',
  collection: 'elem.graphic',
  fields: {
    element: BigmlElement,
    design: ...
  }
})*/

const BigmlElement = Class.create({
  name: 'bigml.element',
  collection: Local,
  typeField: 'type',
  secured: false,
  fields: {
    name: {
      type: String,
      default: ''
    },
    properties: {
      type: [BigmlProperty],
      default() { return []; }
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
  }
});

const BigmlManagedComponent = BigmlComponent.inherit({
  name: 'bigml.managedcomponent',
  fields: {
    inputPorts: {
      type: [BigmlInputPort],
      default() { return []; }
    }
  }
});

const BigmlCompositeComponent = BigmlManagedComponent.inherit({
  name: 'bigml.compositecomponent',
  fields: {
    children: {
      type: [Mongo.ObjectID],
      default() { return []; }
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
      type: [Mongo.ObjectID],
      default() { return []; }
    },
    pipelines: {
      type: [Mongo.ObjectID],
      default() { return []; }
    }
  }
});

/* -- Some more specific base types -- */
const BigmlDataprocessor = BigmlManagedComponent.inherit({
  name: 'bigml.dataprocessor'
});

const BigmlStoragesystem = BigmlManagedComponent.inherit({
  name: 'bigml.storagesystem'
});

const BigmlDatasource = BigmlManagedComponent.inherit({
  name: 'bigml.datasource'
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