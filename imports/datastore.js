// TODO sortir code transformation map
import { Mongo } from 'meteor/mongo';

import { Class, Type } from 'meteor/jagi:astronomy';
import { Version } from '/imports/synchronization/version';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';

// used to compare two collections and compute changes (JSON-Patch standard)
var jsonpatch = require('fast-json-patch');

// Persistants Collections
const Elements = new Mongo.Collection('elements');

// Local collection in client
const Local = new Mongo.Collection(null);
const LocalMaster = new Mongo.Collection(null);
// merging function
Local.merge = mergeFct;
// Fork Master (load master collection data into our local collection)
Local.loadContent = loadContentFct;
// Commit (create version) but do not merge with master
Local.commit = commitFct;

// Local Collection : functions
function commitFct(commitOwnerName, commitDescription) {
    // Extract JSON from our local branch
    var localData = Local.find().fetch();

    // Convert it into a map (id reference the element)
    var localDataMapById = {};
    localData.forEach((component) => {
        localDataMapById[component._id] = component;
    });

    // Extract JSON from Master
    var masterData = LocalMaster.find().fetch();
    // Convert it into a map (id reference the element)
    var masterDataMapById = {};
    masterData.forEach((component) => {
        masterDataMapById[component._id] = component;
    });

    // Compute the diff between Master and Local
    var diff = jsonpatch.compare(masterDataMapById, localDataMapById);

    // Store the diff
    let newVersion = new Version();
    newVersion.changes = diff;
    newVersion.description = commitDescription;
    newVersion.owner = commitOwnerName;
    newVersion.save();

    LocalMaster.remove({});
    Local.find().forEach( function(x) {
        LocalMaster.insert(x);
    });
    return diff; // in case it's called by the merging function (need diff)
}
function mergeFct(commitOwnerName, commitDescription) {
    // Step 1 : We commit
    var diff = commitFct(commitOwnerName, commitDescription);
    // Step 2 : Apply diff on master (merge)
    driverJsonPatchMongo.applyPatch(diff, Elements);
}
function loadContentFct() {
    // Get every element from Element.
    // For each of them we insert them into the Local collection
    Elements.find().forEach( function(x) {
        Local.insert(x);
        LocalMaster.insert(x);
    });
}

// export our collections
export { Elements, Local };