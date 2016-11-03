import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Class, Type, Validator } from 'meteor/jagi:astronomy';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';

import { Diff } from '/imports/synchronization/patch.js';

import { BigmlElement, BigmlComponent, BigmlManagedComponent, BigmlInputPort, BigmlOutputPort, BigmlDatamodel } from '/imports/components/basic.js';

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
        if (!this._parentBranch) console.error('save(): No parent branch set!');
        this._parentBranch.save();
      };
      e.target.elements.getElements().forEach(el => el._parent = e.target );
    }
  },
  methods: {
    /**
     * Calculates the diff from the provided version to the current one, i.e. what changes are necessary to get to this version from provided version
     * @argument {Version} [version] - The version to calculate changes from
     * @returns {Object} Object of changes with DB ID as keys
     */
    calculateDiff(version) {
      return Diff({prefix: 'components', old: version.elements.components, new: this.elements.components },
                  {prefix: 'pipelines',  old: version.elements.pipelines,  new: this.elements.pipelines  });
    },
    
    
    /**
     * Finds the component that owns the specified port
     * @argument {(BigmlInputPort|BigmlOutputPort)} [port] - The port
     * @returns {Component} Component owing the given port
     */
    findComponentOwningPort(port) {
      if (port instanceof BigmlOutputPort)
        return this.elements.components.find(component => component.outputPorts && component.outputPorts.some(p => p._id._str == port._id._str) );
      else if (port instanceof BigmlInputPort)
        return this.elements.components.find(component => component.inputPorts && component.inputPorts.some(p => p._id._str == port._id._str) );
    },
    /**
     * Calculates the canvas position of a given port, based on the components size and position
     * @argument {(BigmlInputPort|BigmlOutputPort)} [port] - The port
     * @returns {Object} Location (x,y) of the port
     */
    getPortPosition(port) {
      var component = this.findComponentOwningPort(port);
      if (component) return component.getPortPosition(port);
    }
  }
});

export {Version};