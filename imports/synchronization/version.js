import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Class, Type, Validator} from 'meteor/jagi:astronomy';

import {BigmlElement, BigmlComponent, BigmlManagedComponent, BigmlInputPort, BigmlOutputPort, BigmlDatamodel} from '/imports/components/basic.js';

const Version = Class.create({
  name: 'version',
  fields: {
    _id: {
      type: Mongo.ObjectID,
      default() { return new Mongo.ObjectID(); }
    },
    description: {
      type: String,
      default: 'No description'
    },
    timestamp: {
      type: Date,
      default() { return new Date(); }
    },
    previous: {
      type: Mongo.ObjectID,
      optional: true
    },
    mergedFrom: {
      type: Mongo.ObjectID,
      optional: true,
    },
    changes: {
      type: Object,
      default() { return {}; }
    },
    elements: {
      type: BigmlDatamodel,
      default() { return new BigmlDatamodel(); }
    }
  },
  events: {
    beforeInsert(e) {
      e.target.timestamp = new Date();
    },
    afterInit(e) {
      e.target.save = function () {
        if (!this._parentBranch)
          console.error('save(): No parent branch set!');
        this._parentBranch.save();
      };
      e.target.elements.getElements().forEach(el => {
        el._parent = e.target;
      });
    }
  },
  methods: {
    findComponentOwningPort(port) {
      if (port instanceof BigmlOutputPort) {
        return this.elements.components.find(component => {
          return component.outputPorts.some(p => p._id._str == port._id._str);
        });
      } else if (port instanceof BigmlInputPort) {
        return this.elements.components.find(component => {
          return component.inputPorts.some(p => p._id._str == port._id._str);
        });
      }
    },
    getPortPosition(port) {
      var component = this.findComponentOwningPort(port);
      if (component)
        return component.getPortPosition(port);
    }
  }
});

export {Version};