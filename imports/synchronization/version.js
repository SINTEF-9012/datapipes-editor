import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Class, Type, Validator} from 'meteor/jagi:astronomy';

import {BigmlElement} from '/imports/components/basic.js';

const Branches = new Mongo.Collection('branches');

const Version = Class.create({
    name: 'version',
    fields: {
        '_id': {
            type: Mongo.ObjectID,
            default() {
                return new Mongo.ObjectID();
            }
        },
        description: {
            type: String,
            default: 'No description'
        },
        timestamp: {
            type: Date,
            immutable: true,
            default() {
                return new Date();
            }
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
            default() {
                return [];
            }
        },
        elements: {
            type: [BigmlElement],
            default() {
                return [];
            }
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
            e.target.elements.forEach(el => {
                el._parent = e.target;
            });
        }
    },
    methods: {}
});

var getUserId = function () {
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
            default() {
                return [];
            }
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
        merge: function (description, ownerName) {
            console.error("MERGE NOT IMPLEMENTED YET");
        },
        pullMaster: function () {
            console.error("PULL NOT IMPLEMENTED YET");
        },
        lastVersion: function () {
            return this.versions.reduce(function (pre, cur) {
                return Date.parse(pre.timestamp) > Date.parse(cur.timestamp) ? pre : cur;
            })
        },
        commit: function () {
            // create new version on same branch
            var newVersion = new Version();
            var oldVersion = this.lastVersion();
            newVersion.elements = oldVersion.elements;
            newVersion.previous = oldVersion._id;
            this.versions.push(newVersion);
            this.save();
            return newVersion;
        },
        rollback: function (idBranch) {
            console.log('ROLLBACK NOT IMPLEMENTED YET');
        },
        init: function () {
            this.elements = Branch.find({name: 'master'}).lastVersion().elements;
        }
    }
});

Branch.getUserBranches = getUserBranchFct;
Branch.createNewBranch = createNewBranchFct;
Branch.getMasterBranch = getMasterBranchFct;
Branch.getMasterHead = getMasterHeadFct;

/**  BRANCH FCT **/
function getUserBranchFct() {
    var currentUser;
    try {
        currentUser = Meteor.userId();
    }catch (e) {
        return;
    }
    return Branch.find({$or: [ {'owner': currentUser}, {'_id': 'master'}]});
}

function createNewBranchFct() {
    let newBranch = new Branch();
    let newVersion = new Version();
    newVersion.previous = Branch.getMasterHead()._id;
    newVersion.elements = newVersion.previous.elements;
    newBranch.versions.push(newVersion);
    newBranch.save((err, id) => {
        return Branch.findOne(id);
    });
    // TODO return a promise ?
    return newBranch;
}

function createNewBranchFct(branchName) {
    let newBranch = new Branch();
    newBranch.name = branchName;
    let newVersion = new Version();
    newVersion.previous = Branch.getMasterHead()._id;
    newVersion.elements = newVersion.previous.elements;
    newBranch.versions.push(newVersion);
    newBranch.save((err, id) => {
        return Branch.findOne(id);
    });
    return newBranch;
}

function getMasterBranchFct() {
    return Branch.findOne('master');
}

function getMasterHeadFct() {
    var master = Branch.getMasterBranch();
    if (master)
        return master.lastVersion();
}

export {Branch, Version};