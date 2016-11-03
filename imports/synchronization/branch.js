import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Class, Type, Validator } from 'meteor/jagi:astronomy';

import { Version } from '/imports/synchronization/version';
import { SynchronizationUtils } from '/imports/synchronization/utils';
import { Branches } from '/imports/synchronization/datastore';
import { Compare, Apply } from '/imports/synchronization/patch.js';

import { driverJsonPatchMongo } from '/imports/mongo_json_patch/mongo_json_patch';

var getRawElements = SynchronizationUtils.getRawElements;

/**
 * last update : 03/10/2016
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
      default() {
        try { return Meteor.userId(); }
        catch (e) { return ''; }
      },
      immutable: true
    },
    versions: {
      type: [Version],
      default() { return []; }
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
      afterInit(e) {
        e.target.versions.forEach(v => v._parentBranch = e.target);
      }
    },
    methods: {
      /**
       * Get last version of branch
       * @returns {Version} Last version of this branch
       */
      head() {
        return this.versions.reduce((p,c) => c.timestamp > p.timestamp ? c : p);
      },
      
      /**
       * Create new branch from current branch, based on the last version
       * @argument {string} name - The name of the new branch
       * @returns {Branch} New branch
       */
      branch(name) {
        var b = new Branch(),
            v = new Version(),
            ov = this.head();
        
        b.name = name;
        b.versions.push(v);
        v.elements.components = ov.elements.components.slice();
        v.elements.pipelines = ov.elements.pipelines.slice();
        v.previous = ov._id;
        
        b.save();
        return b;
      },
      
      /**
       * Stores the current working model as a version, and creates a new version for editing
       * @argument {string} [description] - A message to store together with the commit for documenting changes
       * @returns {Version} The new version for editing
       */
      commit(description) {
        var v = new Version(),
            oldv = this.head(),
            prevv = Branch.findVersion(oldv.previous);
        
        v.elements.components = oldv.elements.components.slice();
        v.elements.pipelines = oldv.elements.pipelines.slice();
        v.previous = oldv._id;
        
        if (description) oldv.description = description;
        oldv.changes = oldv.calculateDiff(prevv);
        
        this.versions.push(v);
        this.save();
        oldv.save();
      },
      
      /**
       * Merges the head of master with the current branch
       * @argument {Object} [resolutions] - Conflict resolutions to apply if there are any conflicts during the merge
       * @returns {(Boolean|Object)} True if the merge was a success, or an Object with conflicts if manual resolution is necessary
       */
      pull(resolutions) {
        if (this._id == 'master') return false;
        
        var master = Branch.Master(),
            mhead = master.head(),
            chead = this.head(),
            common = Branch.findLinkToMaster(chead);
        
        // If we have already merged with master branch, do nothing
        if (mhead._id._str == common._id._str) return true;
        
        // Compare changes applied in master to the changes applied in branch from common version
        var masterChanges = mhead.calculateDiff(common),
            branchChanges = chead.calculateDiff(common),
            conflicts = Compare(masterChanges,branchChanges),
            patches = undefined;
        
        // If there are any conflicting changes, the user needs to resolve them
        if (Object.keys(conflicts.conflicting).length) {
          // Check if resolutions are supplied
          var resolved = false;
          if (resolutions)
            resolved = Object.keys(conflicts.conflicting).reduce((others,key) => others && key in resolutions, true);
          
          if (!resolved)
            return conflicts;
          else {
            patches = conflicts.nonconflicting;
            Object.keys(resolutions).forEach(key => patches[key] = resolutions[key]);
          }
        } else {
          patches = conflicts.nonconflicting;
        }
        
        // At this point, any conflicts should be resolved, and all patches will be in the patches variable
        var bv = new Version();
        bv.elements.components = common.elements.components.slice();
        bv.elements.pipelines = common.elements.pipelines.slice();
        
        console.log('Patches: ',patches);
        console.log('Before: ', bv.elements.components, bv.elements.pipelines);
        
        Apply(patches, {prefix: 'components', arr: common.elements.components.slice() },
                       {prefix: 'pipelines',  arr: common.elements.pipelines.slice()  });
        
        
        return;
        
        // Check if there are any conflicting changes
        var diffOfTheChanges = driverJsonPatchMongo.identifyConflictsFromDiffs(branchChanges, masterChanges);
        if (Object.keys(diffOfTheChanges.conflicts).length) {
        } else {
          // No conflicts, we can merge
          var bv = new Version();
          
          bv.elements.components = common.elements.components.slice();
          bv.elements.pipelines = common.elements.pipelines.slice();
          if (Object.keys(diffOfTheChanges.nonConflicts).length) {
            // Apply non-conflicting changes from the common point
            //driverJsonPatchMongo.applyPatchToArray(diffOfTheChanges.nonConflicts, v.elements.getElements(), Branch.getMasterBranch(), branchHead.elements.getElements().slice());
          }
          
          bv.previous = chead._id;
          bv.mergedFrom = mhead._id;
          bv.description = 'Merge from Master version "'+chead.description+'"';
          bv.changes = mv.calculateDiff(chead);
          
          this.versions.push(bv);
          this.save();
        }

        console.log('Conflicts: ',diffOfTheChanges);
        
      },
      
      /**
       * Merges the head of master with the current branch, if there are any conflicts this will fail, and has to be resolved by pulling first
       * @returns {Boolean} True if the merge is succesfull, False if a pull to resolve potential conflicts is necessary
       */
      push() {
        if (this._id == 'master') return false;
        
        var master = Branch.Master(),
            mhead = master.head(),
            chead = this.head(),
            common = Branch.findLinkToMaster(chead);
        
        // If the current head is linked to the head of master...
        if (mhead._id._str == common._id._str) {
          //... we can go ahead and push changes
          var mv = new Version();
          
          mv.elements.components = chead.elements.components.slice();
          mv.elements.pipelines = chead.elements.pipelines.slice();
          mv.previous = mhead._id;
          mv.mergedFrom = chead._id;
          mv.owner = 'system';
          mv.description = 'Merge from branch "'+this.name+'" version "'+chead.description+'"';
          mv.changes = mv.calculateDiff(mhead);
          
          master.versions.push(mv);
          master.save();
          
          // Also "commit" the current head
          var prevv = Branch.findVersion(chead.previous);
          chead.changes = chead.calculateDiff(prevv);
          
          this.closed = true;
          this.save();
          
          return true;
        } else {
          //... if not, we have to do a pull to merge master into current branch first
          return false;
        }
      },
      
      
      
/*
      
      
      
      
      
      
        merge: mergeFct,
        pull: pullFct,
        applyConflictResolution: applyConflictResolutionFct,
        rollback: rollbackFct,
        getVersion: getVersionFct,
        getLastElementVersion: getLastElementVersionFct*/
    }
});




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
    var branchPipeChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements.pipelines), getRawElements(branchHead.elements.pipelines));
    var masterPipeChanges = driverJsonPatchMongo.compare(getRawElements(pulledVersion.elements.pipelines), getRawElements(masterHead.elements.pipelines));
    // STEP 2
    // Compare these diffs. (kind of diff of diffs)
    // Generate a structure which contains in .conflicts conflicts ([ [patchs1], [patchs2] ] and in nonconflicts diff which is ok
    // return this structure to the user if it contains conflicts
    var diffOfTheChanges = driverJsonPatchMongo.identifyConflictsFromDiffs(branchChanges, masterChanges);
    var diffOfThePipeChanges = driverJsonPatchMongo.identifyConflictsFromDiffs(branchPipeChanges, masterPipeChanges);
    console.log(diffOfTheChanges,diffOfThePipeChanges);
  
    if (Object.keys(diffOfTheChanges.conflicts).length,Object.keys(diffOfThePipeChanges.conflicts).length) {
        // Send conflicts to the user
        return [diffOfTheChanges,diffOfThePipeChanges];
    } else {
        // No conflicts, we can merge
        let v = new Version();
        v.elements.components = pulledVersion.elements.getElements().slice();
        v.elements.pipelines = pulledVersion.elements.pipelines.slice();
        // if we got changes non conflicted changes in the master branch we apply them
        if (Object.keys(diffOfTheChanges.nonConflicts).length)
            driverJsonPatchMongo.applyPatchToArray(diffOfTheChanges.nonConflicts, v.elements.getElements(), Branch.getMasterBranch(), branchHead.elements.getElements().slice());
        //if (Object.keys(diffOfThePipeChanges.nonConflicts).length) // TODO HERE!!!
        v.changes = driverJsonPatchMongo.compare(getRawElements(branchHead.elements.getElements()), getRawElements(v.elements.getElements()));

        v.previous = branchHead._id;
        v.mergedFrom = masterHead._id;
        this.versions.push(v);
        this.lastPulledVersion = masterHead._id;
        this.save();
    }
}













/* ------- Class functions ------- */
Branch.Master = () => Branch.findOne('master');

Branch.UserBranches = () => {
  try { return Branch.find({$or: [ {'owner': Meteor.userId(), 'closed': false}, {'_id': 'master'}]}); }
  catch (e) { return undefined; }
};

Branch.findVersionBranch = (id) => {
  var oid = id instanceof Mongo.ObjectID ? id : new Mongo.ObjectID(id);
  return Branch.findOne({ versions: { $elemMatch: { _id: oid }}});
};

Branch.findVersion = (id) => {
  var oid = id instanceof Mongo.ObjectID ? id : new Mongo.ObjectID(id),
      branch = Branch.findVersionBranch(oid);
  
  if (branch) return branch.versions.find(v => v._id._str == oid._str);
  else return undefined;
};

Branch.findLinkToMaster = (version) => {
  var done = false,
      potential = version;
  
  // TODO: Only works with direct links to master, if we want to support merging other branches that has a link to master, we need to make a recursive version of this...
  
  while (!done) {
    // Next potential origin in master branch
    if (potential.mergedFrom && Branch.findVersionBranch(potential.mergedFrom)._id == 'master')
      potential = potential.mergedFrom;
    else
      potential = potential.previous;

    // Is the potential candidate on the master branch?
    if (Branch.findVersionBranch(potential)._id == 'master')
      done = true;
    
    potential = Branch.findVersion(potential);
  }
  
  return potential;
};






/*
Branch.getUserBranches = getUserBranchFct;
Branch.getMasterBranch = getMasterBranchFct;
Branch.getMasterHead = getMasterHeadFct;
*/
/** Object Branch FCT **/




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



export { Branch }