import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Class, Type, Validator } from 'meteor/jagi:astronomy';

import { BigmlElement } from '/imports/components/basic.js';

const Branches = new Mongo.Collection('branches');



const Version = Class.create({
  name: 'version',
  fields: {
    '_id': {
      type: Mongo.ObjectID,
      default() { return new Mongo.ObjectID(); }
    },
    description: {
      type: String,
      default: 'No description'
    },
    timestamp: {
      type: Date,
      immutable: true,
      default() { return new Date(); }
    },
    previous: {
      type: Mongo.ObjectID,
      immutable: true,
      optional: true
    },
    mergedFrom: {
      type: Mongo.ObjectID,
      immutable: true,
      optional: true,
    },
    changes: {
      type: [Object],
      default() { return []; }
    },
    elements: {
      type: [BigmlElement],
      default() { return []; }
    }
  },
  events: {
    beforeInsert(e) {
      e.target.timestamp = new Date();
    },
    afterInit(e) {
      e.target.save = function() {
        if (!this._parentBranch)
          console.error('save(): No parent branch set!');
        this._parentBranch.save();
      };
      e.target.elements.forEach(el => {
        el._parent = e.target;
      });
    }
  }
});

var getUserId = function() {
  try {
    return Meteor.userId();
  } catch (e) {
    return '';
  }
};

const Branch = Class.create({
  name: 'branch',
  collection: Branches,
  typeField: 'type',
  secured: false,
  fields: {
    name: {
      type: String,
      default: 'Temporary'
    },
    owner: {
      type: String,
      default: getUserId,
      immutable: true
    },
    versions: {
      type: [Version],
      default() { return []; }
    }
  },
  events: {
    beforeInsert(e) {
      this.owner = getUserId();
    },
    afterInit(e) {
      e.target.versions.forEach(v => {
        v._parentBranch = e.target;
      });      
    }
  },
  methods: {
    merge: function(description, ownerName) {
      console.error("MERGE NOT IMPLEMENTED YET");
    },
    commit: function(description, ownerName) {
      console.error("COMMIT NOT IMPLEMENTED YET");
    },
    pullMaster: function() {
      console.error("PULL NOT IMPLEMENTED YET");
    },
    lastVersion: function() {
      return this.versions.reduce(function(pre, cur) {
        return Date.parse(pre.timestamp) > Date.parse(cur.timestamp) ? pre : cur;
      })
    },
    init: function() {
      this.elements = Branch.find({name: 'master'}).lastVersion().elements;
    }
  }
});

Branch.getMasterBranch = function () {
    return Branch.findOne('master');
}

Branch.getMasterHead = function () {
    var master = Branch.getMasterBranch();
    if (master)
        return master.lastVersion();
};

export { Branch, Version };