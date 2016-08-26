import {Mongo} from 'meteor/mongo';
var jsonpatch = require('fast-json-patch');

// Snippet doing the same job than the usual Object.keys (it's for older browsers)
// It returns keys from a map
if (!Object.keys) Object.keys = function (o) {
    if (o !== Object(o))
        throw new TypeError('Object.keys called on non-object');
    var ret = [], p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
    return ret;
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

/**
 * Driver exported at the end
 * @type {{applyPatchToArray: applyPatchToArrayFct, applyPatchToCollection: applyPatchToCollectionFct, compare: compareFct, compareDiff: compareDiffFct, identifyConflictsFromDiffs: identifyConflictsFromDiffsFct}}
 */
const driverJsonPatchMongo = {
    applyPatchToArray: applyPatchToArrayFct,
    applyPatchToCollection: applyPatchToCollectionFct,
    compare: compareFct,
    compareDiff: compareDiffFct,
    identifyConflictsFromDiffs: identifyConflictsFromDiffsFct
};

/**
 * This function is used to replace a property value by another one. It's recursive.
 * Simply, we deep-search while we got more than one token.
 * A token is an array like [ "location", "initialPosition", "x" ]. x is an attribute and others are objects.
 * @param value
 * @param tokens
 * @param elem
 * @returns {*}
 */
function applyPatchToElem(value, tokens, elem) {
    if (tokens.length > 1) {
        applyPatchToElem(value, tokens.slice(0,1), elem[tokens[0]]);
    } else {
        return elem[0] = value;
    }
}

/**
 * Apply a set of patches to an array of elements.
 * @param patch
 * @param arrayOfElements
 * @param targetCollection
 * @param branchElements
 */
function applyPatchToArrayFct(patch, arrayOfElements, targetCollection, branchElements) {
    const keys = Object.keys(patch);
    // a key is the id of an element
    keys.forEach((key) => {
        let requestset = {};
        // a patch[key] is an array of patches on a element
        // We are using JSON-patch standard except that the path would be "location.x" instead of "location/x"
        patch[key].forEach((patchelem) => {
            if (patchelem.op == "add") {
                var elem = targetCollection.getLastElementVersion(key);
                if (!elem) {
                    elem = branchElements.find(function (elem) {
                        return elem._id._str == key;
                    });
                }
                delete elem._parent;
                delete elem.save;
                arrayOfElements.push(elem);
            } else if (patchelem.op == "replace") {
                var tokens = patchelem.path.split(".");
                var elem = arrayOfElements.find(function (elem) {
                    return elem._id._str == key;
                });
                applyPatchToElem(patchelem.value, tokens, elem);
            } else if (patchelem.op == "remove") {
                arrayOfElements.remove(arrayOfElements.find(function (elem) {
                    return elem._id._str == key;
                }))
            } else {
                console.error("ELSE NOT IMPLEMENTED, SEE mongo_json_patch.js");
            }
        });
    })
}

/**
 * Apply patches directly in a mongo collection
 * @param patch
 * @param targetCollection
 */
function applyPatchToCollectionFct(patch, targetCollection) {
    /*** Step 1 : Preprocessing ***/
    //patch = transformPatch(patch);

    /*** Step 2 : update elements ***/
        // Get all keys of the hashmap
    const keys = Object.keys(patch);
    keys.forEach((key) => {
        let requestset = {};
        patch[key].forEach((patchelem) => {
            if (patchelem.op == "add") {
                delete patchelem._id;
                targetCollection.insert(patchelem.value);
            } else if (patchelem.op == "replace") {
                requestset[patchelem.path] = patchelem.value;
            } else if (patchelem.op == "remove") {
                targetCollection.remove(key);
            } else {
                console.error("ELSE NOT IMPLEMENTED, SEE mongo_json_patch.js");
            }
        });
        if (requestset != {}) {
            targetCollection.update(
                {"_id": key},
                {
                    $set: requestset
                }
            );
        }
    });
}

/**
 * Diff between collections
 * @param collectionSrc
 * @param collectionDst
 */
function compareFct(collectionSrc, collectionDst) {
    var diff = jsonpatch.compare(CollectionToMapByID(collectionSrc), CollectionToMapByID(collectionDst));
    return transformPatch(diff);
}

/**
 * Diff of the diff
 * @param diffSrc
 * @param diffDst
 * @returns {{}}
 */
function compareDiffFct(diffSrc, diffDst) {
    // merge keys from these two diff
    let keys = arrayUnique(Object.keys(diffSrc).concat(Object.keys(diffDst)));

    let mergedDiff = {};
    keys.forEach((key) => {
        // If same, we do not care
        // else we had it to our new diff of diff
        if (JSON.stringify(diffSrc[key]) !== JSON.stringify(diffDst[key])) {
            mergedDiff[key] = [
                diffSrc[key],
                diffDst[key]
            ]
        }
    });
    return mergedDiff;
}

/**
 * A is a diff
 * B is a diff
 * we return C, an object, like :
 *     - C.conflicts = A intersect B
 *     - C.nonConflicts = A union B - A intersect B  (diff of the diff)
 * @param diffSrc
 * @param diffDst
 * @returns {{}}
 */
function identifyConflictsFromDiffsFct(diffSrc, diffDst) {
    let keys = arrayUnique(Object.keys(diffSrc).concat(Object.keys(diffDst)));
    let sortedDiff = {};
    sortedDiff.conflicts = {};
    sortedDiff.nonConflicts = {};
    var debug1 = 0;
    var debug2 = 0;
    keys.forEach((key) => {
        // If same, we do not care
        // else we had it to our new diff of diff
        if (typeof diffSrc[key] !== 'undefined' && typeof diffDst[key] !== 'undefined') {
            if ((JSON.stringify(diffSrc[key]) !== JSON.stringify(diffDst[key])) &&
                (diffSrc[key][0].op != "add" && diffDst[key][0].op != "add")) {
                if (diffSrc[key] && diffDst[key]) {
                    sortedDiff.conflicts[key] = [diffSrc[key], diffDst[key]];
                }
            }
        } else if (diffDst[key]) {
            debug1++;
            sortedDiff.nonConflicts[key] = diffDst[key];
        } else if (diffSrc[key]) {
            debug2++;
            sortedDiff.nonConflicts[key] = diffSrc[key];
        }
    });
    return sortedDiff;
}

/**
 * return a map : < idOfTheElement, element >
 * @param collectionFetched
 * @returns {{}}
 */
function CollectionToMapByID(collectionFetched) {
    var dataMapById = {};
    collectionFetched.forEach((component) => {
        //delete component._parent;
        dataMapById[component._id._str] = component;
    });
    return dataMapById;
}

function transformPatch(patch) {
    var patchSortedById = {};
    patch.forEach((operation) => {
        const tokens = operation.path.split("/");
        if (!patchSortedById[tokens[1]])
            patchSortedById[tokens[1]] = [];
        operation.path = tokens[2];
        for (var i = 3; i < tokens.length; ++i) {
            operation.path = operation.path + "." + tokens[i];
        }
        patchSortedById[tokens[1]].push(operation);
    });
    return patchSortedById;
}

// merge two arrays
function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

export {driverJsonPatchMongo};