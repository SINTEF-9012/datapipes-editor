import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Class, Type, Validator} from 'meteor/jagi:astronomy';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';
import {BigmlElement} from '/imports/components/basic.js';

const Branches = new Mongo.Collection('branches');

const Version = Class.create({
    name: 'version',
    fields: {
        _id: {
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
            optional: true
        },
        mergedFrom: {
            type: Mongo.ObjectID,
            optional: true,
        },
        changes: {
            type: Object,
            default() {
                return {};
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

function getRawElements(arrayOfElements) {
    return arrayOfElements.map((e) => { return e.raw();});
}
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
        },
        lastPulledVersion: {
            type: Mongo.ObjectID,
            optional: true
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
        merge: function () {
            let masterBranch = Branch.getMasterBranch();
            if (this.lastPulledVersion._str == masterBranch.lastVersion()._id._str) {
                console.log("DERNIERE VERSION DEJA PULL");
                // merge
                let v = new Version();
                let branchHead = this.lastVersion();
                v.elements = branchHead.elements.slice();
                v.owner = "system";
                v.changes = driverJsonPatchMongo.compare(getRawElements(masterBranch.lastVersion().elements), getRawElements(v.elements));
                v.previous = masterBranch.lastVersion()._id;
                v.mergedFrom = branchHead._id;
                masterBranch.versions.push(v);
                masterBranch.save();
            }
            // STEP 1
            // Pull master

            // STEP 2
            // if last pulled version is different from last version of master go back to STEP 1

            // STEP 3
            // Create new version in master branch which has the same elements than our current version
        },
        pull: function () {

            // STEP 1
            // DIFF LAST PULLED VERSION V1 with current version of the branch
            // DIFF Last pulled version V1 with last version of master
            var branchHead = this.lastVersion();
            var masterHead = Branch.getMasterHead();

            if (masterHead._id == this.lastPulledVersion) {
                console.log("no changes in master");
                return {};
            }
            var pulledVersion = Branch.getMasterBranch().getVersion(this.lastPulledVersion);
            var branchChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements), getRawElements(branchHead.elements));
            var masterChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements), getRawElements(masterHead.elements));
            // STEP 2
            // Compare these diffs. (kind of diff of diffs)
            // Generate a structure with these differences per element
            // return this to the user
            var diffOfTheChanges = driverJsonPatchMongo.identifyConflictsFromDiffs(branchChanges, masterChanges);
            if (Object.keys(diffOfTheChanges).length) {
                // manage conflicts
                return diffOfTheChanges;
                // STEP 3
                // generate new diff from user choices

                // STEP 4
                // Apply this new diff to our current version
            } else {
                // No conflicts, we can merge
                let v = new Version();
                v.elements = branchHead.elements.slice();
                // if we got changes non conflicted changes in the master branch we apply them
                if (Object.keys(masterChanges).length)
                    driverJsonPatchMongo.applyPatchToArray(masterChanges, v.elements, Branch.getMasterBranch());
                v.changes = driverJsonPatchMongo.compare(getRawElements(branchHead.elements), getRawElements(v.elements));
                console.log("Line 177 : compare OK");
                v.previous = branchHead._id;
                v.mergedFrom = masterHead._id;
                this.versions.push(v);
                this.lastPulledVersion = masterHead._id;
                this.save();
                console.log("Line 183 : Save OK")
            }
        },
        applyConflictResolution: function (conflictResolutionMap) {
            var branchHead = this.lastVersion();
            var masterHead = Branch.getMasterHead();
            var v = new Version();
            v.elements = branchHead.elements.slice();
            var pulledVersion = Branch.getMasterBranch().getVersion(this.lastPulledVersion);
            var masterChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements), getRawElements(masterHead.elements));

            driverJsonPatchMongo.applyPatchToArray(masterChanges, v.elements, Branch.getMasterBranch());
            if (Object.keys(conflictResolutionMap).length) {
                driverJsonPatchMongo.applyPatchToArray(conflictResolutionMap, v.elements, Branch.getMasterBranch());
            }

            console.log(v.elements);
            this.versions.push(v);
            getRawElements(v.elements);
            getRawElements(masterHead.elements);
            v.changes = driverJsonPatchMongo.compare(getRawElements(masterHead.elements), getRawElements(v.elements));
            console.log('NEXT');
            v.previous = branchHead._id;
            v.mergedFrom = masterHead._id;
            this.lastPulledVersion = masterHead._id;
            this.save();
        },
        commit: function () {
            // create new version on same branch
            var newVersion = new Version();
            var currentVersion = this.lastVersion();
            newVersion.elements = currentVersion.elements;
            newVersion.previous = currentVersion._id;

            // Search the old version

            if (branchOfTheOldVersion == null) return;
            var oldVersion = branchOfTheOldVersion.versions.find(function (version) {
                return version._id._str == currentVersion.previous._str;
            });

            // Compute diff of the Old version, with our current and store it in the currentVersion array of changes
            currentVersion.changes = driverJsonPatchMongo.compare(getRawElements(oldVersion.elements), getRawElements(currentVersion.elements));

            // Push the new Version (so it becomes our current now)
            this.versions.push(newVersion);

            // Save the branch
            this.save();

            return newVersion;
        },
        rollback: function (idBranch) {
            console.log('ROLLBACK NOT IMPLEMENTED YET');
        },
        lastVersion: function () {
            return this.versions.reduce(function (pre, cur) {
                return Date.parse(pre.timestamp) > Date.parse(cur.timestamp) ? pre : cur;
            })
        },
        init: function () {
            let version = new Version();
            let masterHead = Branch.getMasterHead();
            version.elements = masterHead.elements;
            version.previous = masterHead._id;
            this.versions.push(version);
            this.lastPulledVersion = masterHead._id;
            this.save();
        },
        getVersion: function(versionId) {
            return this.versions.find(function (version) {
                return version._id._str == versionId._str;
            });
        },
        getLastElementVersion: function(elementId) {
            return this.lastVersion().elements.find(function (elem) {
                return elem._id._str == elementId;
            });
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
    newBranch.init();
    return newBranch;
}

function createNewBranchFct(branchName) {
    let newBranch = new Branch();
    newBranch.name = branchName;
    newBranch.init();
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