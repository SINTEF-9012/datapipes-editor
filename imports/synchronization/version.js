import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Class, Type, Validator} from 'meteor/jagi:astronomy';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';
import {BigmlElement, BigmlDatamodel} from '/imports/components/basic.js';

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
            type: BigmlDatamodel,
            default() {
                return new BigmlDatamodel;
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
            e.target.elements.getElements().forEach(el => {
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
    return arrayOfElements.map((e) => {
        return e.raw();
    });
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
        closed: {
            type: Boolean,
            default: false
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
                // merge
                let v = new Version();
                let branchHead = this.lastVersion();
                v.elements.components = branchHead.elements.getElements().slice();
                v.owner = "system";
                v.changes = driverJsonPatchMongo.compare(getRawElements(masterBranch.lastVersion().elements.getElements()), getRawElements(v.elements.getElements()));
                v.previous = masterBranch.lastVersion()._id;
                v.mergedFrom = branchHead._id;

                masterBranch.versions.push(v);
                masterBranch.save();
                this.lastPulledVersion = Branch.getMasterHead()._id;
                this.closed = true;
                this.save();
            } else {
                this.pull();
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

            // if we already pulled the last version we do not pull again
            if (masterHead._id._str == this.lastPulledVersion._str) {
                console.log('Last pulled version is already the master head, Not pulled again');
                return {};
            }
            var pulledVersion = Branch.getMasterBranch().getVersion(this.lastPulledVersion);
            var branchChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements.getElements()), getRawElements(branchHead.elements.getElements()));
            var masterChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements.getElements()), getRawElements(masterHead.elements.getElements()));
            // STEP 2
            // Compare these diffs. (kind of diff of diffs)
            // Generate a structure which contains in .conflicts conflicts ([ [patchs1], [patchs2] ] and in nonconflicts diff which is ok
            // return this structure to the user if it contains conflicts
            var diffOfTheChanges = driverJsonPatchMongo.identifyConflictsFromDiffs(branchChanges, masterChanges);
            if (Object.keys(diffOfTheChanges.conflicts).length) {
                // manage conflicts
                return diffOfTheChanges;
                // STEP 3
                // generate new diff from user choices

                // STEP 4
                // Apply this new diff to our current version
            } else {
                // No conflicts, we can merge
                let v = new Version();
                v.elements.components = pulledVersion.elements.getElements().slice();
                // if we got changes non conflicted changes in the master branch we apply them
                if (Object.keys(diffOfTheChanges.nonConflicts).length)
                    driverJsonPatchMongo.applyPatchToArray(diffOfTheChanges.nonConflicts, v.elements.getElements(), Branch.getMasterBranch(), branchHead.elements.getElements().slice());
                v.changes = driverJsonPatchMongo.compare(getRawElements(branchHead.elements.getElements()), getRawElements(v.elements.getElements()));

                v.previous = branchHead._id;
                v.mergedFrom = masterHead._id;
                this.versions.push(v);
                this.lastPulledVersion = masterHead._id;
                this.save();
            }
        },
        applyConflictResolution: function (conflictResolutionMap) {
            var branchHead = this.lastVersion();
            var masterHead = Branch.getMasterHead();
            var v = new Version();
            v.elements.components = Branch.getMasterBranch().getVersion(this.lastPulledVersion).elements.getElements().slice();
            if (Object.keys(conflictResolutionMap).length) {
                driverJsonPatchMongo.applyPatchToArray(conflictResolutionMap, v.elements.getElements(), Branch.getMasterBranch(), branchHead.elements.getElements().slice());
            }

            this.versions.push(v);
            v.changes = driverJsonPatchMongo.compare(getRawElements(masterHead.elements.getElements()), getRawElements(v.elements.getElements()));
            v.previous = branchHead._id;
            v.mergedFrom = masterHead._id;
            this.lastPulledVersion = masterHead._id;
            this.save();
        },
        commit: function () {
            // create new version on same branch
            var newVersion = new Version();
            var currentVersion = this.lastVersion();
            newVersion.elements.components = currentVersion.elements.getElements();
            newVersion.previous = currentVersion._id;

            // Search the old version
            var branchOfTheOldVersion = Branch.findOne({
                versions: {
                    $elemMatch: { '_id': currentVersion.previous}
                }
            });
            // if (branchOfTheOldVersion == null) return;
            var oldVersion = branchOfTheOldVersion.versions.find(function (version) {
                return version._id._str == currentVersion.previous._str;
            });

            // Compute diff of the Old version, with our current and store it in the currentVersion array of changes
            currentVersion.changes = driverJsonPatchMongo.compare(getRawElements(oldVersion.elements.getElements()), getRawElements(currentVersion.elements.getElements()));
            // Push the new Version (so it becomes our current now)
            this.versions.push(newVersion);

            // Save the branch
            this.save();

            return newVersion;
        },
        rollback: function (idVersion) {
            console.error('ROLLBACK NOT IMPLEMENTED YET');
            // TODO It'll be almost like a commit. You commit an old version (you copy an old version).
            // So the date will be updated and the "last version" will be this one
        },
        lastVersion: function () {
            return this.versions.reduce(function (pre, cur) {
                return Date.parse(pre.timestamp) > Date.parse(cur.timestamp) ? pre : cur;
            })
        },
        init: function () {
            let version = new Version();
            let masterHead = Branch.getMasterHead();
            version.elements.components = masterHead.elements.getElements();
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
            return this.lastVersion().elements.getElements().find(function (elem) {
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
    return Branch.find({$or: [ {'owner': currentUser, 'closed': false}, {'_id': 'master'}]});
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