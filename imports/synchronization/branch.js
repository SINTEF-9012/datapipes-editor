import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Class, Type, Validator } from 'meteor/jagi:astronomy';

import { Version } from '/imports/synchronization/version';
import { SynchronizationUtils } from '/imports/synchronization/utils';
import { Branches } from '/imports/synchronization/datastore';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';

var getRawElements = SynchronizationUtils.getRawElements;

/**
 * last update : 25/08/2016
 * This Class is the Branch class. Branches are stored in the branches mongo collection.
 * A branch is simply multiple editions regrouped in versions made by a single user (the owner attribute)
 * At this date, it is the root class (that's why we store branches in a collection
 */
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
            default: SynchronizationUtils.getUserId,
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
            this.owner = SynchronizationUtils.getUserId();
        },
        afterInit(e) {
            e.target.versions.forEach(v => {
                v._parentBranch = e.target;
            });
        }
    },
    methods: {
        merge: mergeFct,
        pull: pullFct,
        applyConflictResolution: applyConflictResolutionFct,
        commit: commitFct,
        rollback: rollbackFct,
        lastVersion: lastVersionFct,
        init: initFct,
        getVersion: getVersionFct,
        getLastElementVersion: getLastElementVersionFct
    }
});

Branch.getUserBranches = getUserBranchFct;
Branch.createNewBranch = createNewBranchFct;
Branch.getMasterBranch = getMasterBranchFct;
Branch.getMasterHead = getMasterHeadFct;

/** Object Branch FCT **/

/**
 * Merge : Will merge this branch with the master branch
 * First, you can not merge until you have merged on your own branch with the last version of master. Else it pulls again.
 * 1. compute the diff between the head of this branch and the last pulled version (forked version by default)
 * 2. compute the diff between the head of master and the last pulled version.
 * 3. compute the diff between these two diffs the result is an object containing 2 properties
 *    obj {
 *       conflicts: { idElem1: [ [diff1choice], [diff2choice]], idElem2 ... }
 *       nonconflict: { idELem1: [ mergedDiff ], idElem2 ... }
 *    }
 *
 */
function mergeFct() {
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
}

/**
 * Its a merge on our own branch.
 * It returns :
 *    - {} if the last version of master is the last pulled version
 *    - obj {
 *       conflicts: { idElem1: [ [diff1choice], [diff2choice]], idElem2 ... }
 *       nonconflict: { idELem1: [ mergedDiff ], idElem2 ... }
 *    } in case of conflicts
 *    - undefined in case of no conflicts.
 *  @returns conflicts
 */
function pullFct() {

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
        // Send conflicts to the user
        return diffOfTheChanges;
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
}
/**
 * Fonction called when the user has resolved every conflicts
 *
 * @param conflictResolutionMap - array of changes (merge between conflictResolution and nonConflicts in user side)
 */
function applyConflictResolutionFct(conflictResolutionMap) {
    var branchHead = this.lastVersion();
    var masterHead = Branch.getMasterHead();
    var v = new Version();
    v.elements.components = Branch.getMasterBranch().getVersion(this.lastPulledVersion).elements.getElements().slice();
    // Apply the conflict resolution
    if (Object.keys(conflictResolutionMap).length) {
        driverJsonPatchMongo.applyPatchToArray(conflictResolutionMap, v.elements.getElements(), Branch.getMasterBranch(), branchHead.elements.getElements().slice());
    }

    this.versions.push(v);
    v.changes = driverJsonPatchMongo.compare(getRawElements(masterHead.elements.getElements()), getRawElements(v.elements.getElements()));
    v.previous = branchHead._id;
    v.mergedFrom = masterHead._id;
    this.lastPulledVersion = masterHead._id;
    this.save();
}

/**
 * Create a new version in the branch, the array of element is the same than the previous one
 * Store the diff between the old and the current in the old version.
 * @returns newVersion
 */
function commitFct() {
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
}
function rollbackFct(idVersion) {
    console.error('ROLLBACK NOT IMPLEMENTED YET');
    let newVersion = this.commit();
    newVersion.elements.components = this.versions.find(function (version) {
        return version._id._str == idVersion;
    }).elements.components;
    this.save();

    // TODO It'll be almost like a commit. You commit an old version (you copy an old version).
    // So the date will be updated and the "last version" will be this one
}

/**
 * @returns return the last version on the branch
 */
function lastVersionFct() {
    return this.versions.reduce(function (pre, cur) {
        return Date.parse(pre.timestamp) > Date.parse(cur.timestamp) ? pre : cur;
    })
}

/**
 * Init the branch
 */
function initFct() {
    let version = new Version();
    let masterHead = Branch.getMasterHead();
    version.elements.components = masterHead.elements.getElements();
    version.previous = masterHead._id;
    this.versions.push(version);
    this.lastPulledVersion = masterHead._id;
    this.save();
}

/**
 *
 * @param versionId
 * @returns return the version in the branch associated to the param if it exists (else return undefined)
 */
function getVersionFct(versionId) {
    return this.versions.find(function (version) {
        return version._id._str == versionId._str;
    });
}

/**
 * Return the last version of the element in the branch if the element stil exists, it is in the last version,
 * else we do a deep search in order to find it.
 * @param elementId
 * @returns Element
 */
function getLastElementVersionFct(elementId) {
    return this.lastVersion().elements.getElements().find(function (elem) {
        return elem._id._str == elementId;
    });
}


/**  Class BRANCH FCT **/
/**
 * Return an array of branches owned by the current user
 * @returns [Branch]
 */
function getUserBranchFct() {
    var currentUser;
    try {
        currentUser = Meteor.userId();
    }catch (e) {
        return;
    }
    return Branch.find({$or: [ {'owner': currentUser, 'closed': false}, {'_id': 'master'}]});
}

/**
 * Create a new branch
 * @param branchName
 * @returns Branch
 */
function createNewBranchFct(branchName) {
    let newBranch = new Branch();
    newBranch.name = branchName;
    newBranch.init();
    return newBranch;
}

/**
 * returns the master branch
 * @returns Branch
 */
function getMasterBranchFct() {
    return Branch.findOne('master');
}

/**
 * returns the last version in master
 * @returns Version
 */
function getMasterHeadFct() {
    var master = Branch.getMasterBranch();
    if (master)
        return master.lastVersion();
}


export { Branch }