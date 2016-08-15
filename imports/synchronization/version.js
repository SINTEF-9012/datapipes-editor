import { Class, Type } from 'meteor/jagi:astronomy';
import { Mongo } from 'meteor/mongo';
import { BigmlElement} from '/imports/components/basic.js';

const Branches = new Mongo.Collection('branches');

const Version = Class.create({
    name: 'version',
    typeField: 'type',
    secured: false,
    fields: {
        description: {
            type: String,
            default: 'No description'
        },
        owner: {
            type: String,
            default: 'Anonymous'
        },
        timestamp: {
            type: Date,
            default() { return new Date();}
        },
        prevVersions: {
            type: [String],
            default() { return[]; }
        },
        changes: {
            type: [Object],
            default() { return []; }
        },
        elements: {
            type: [BigmlElement],
            default() { return [];}
        }
    }
});

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
            default:'Anonymous'
        },
        versions: {
            type: [Version],
            default() { return []; }
        }
    },
    methods: {
        merge: function(description, ownerName) {
            console.log("MERGE NOT IMPLEMENTED YET");
        },
        commit: function(description, ownerName) {
            console.log("COMMIT NOT IMPLEMENTED YET");
        },
        pullMaster: function() {
            console.log("PULL NOT IMPLEMENTED YET");
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

Branch.getMasterHead = function () {
    return Branch.getMasterBranch().lastVersion();
};

Branch.getMasterBranch = function () {
    return Branch.findOne('masterID');
}

export { Branch, Version };