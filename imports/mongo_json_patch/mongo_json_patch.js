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

const driverJsonPatchMongo = {
    applyPatchToArray: applyPatchToArrayFct,
    applyPatchToCollection: applyPatchToCollectionFct,
    compare: compareFct,
    compareDiff: compareDiffFct,
    identifyConflictsFromDiffs: identifyConflictsFromDiffsFct
};

function applyPatchToElem(value, tokens, elem) {
    if (tokens.length > 1) {
        applyPatchToElem(value, tokens.slice(0,1), elem[tokens[0]]);
    } else {
        return elem[0] = value;
    }
}
function applyPatchToArrayFct(patch, arrayOfElements, targetCollection) {
    const keys = Object.keys(patch);
    keys.forEach((key) => {
        let requestset = {};
        patch[key].forEach((patchelem) => {
            if (patchelem.op == "add") {
                console.log(elem);
                var elem = targetCollection.getLastElementVersion(key);
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
            } else {
                console.log("PATCH ELEM ELSE");
                console.log(patch);
                console.log(patchelem);
                console.error("ELSE NOT IMPLEMENTED, SEE mongo_json_patch.js");
            }
        });
    })
}

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

function compareFct(collectionSrc, collectionDst) {
    var diff = jsonpatch.compare(CollectionToMapByID(collectionSrc), CollectionToMapByID(collectionDst));
    return transformPatch(diff);
}

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

function identifyConflictsFromDiffsFct(diffSrc, diffDst) {
    let keys = arrayUnique(Object.keys(diffSrc).concat(Object.keys(diffDst)));
    let sortedDiff = {};
    sortedDiff.conflicts = {};
    sortedDiff.nonConflicts = {};
    keys.forEach((key) => {
        // If same, we do not care
        // else we had it to our new diff of diff
        if (typeof diffSrc[key] !== 'undefined' && typeof diffDst[key] !== 'undefined') {
            if (JSON.stringify(diffSrc[key]) !== JSON.stringify(diffDst[key]) && (diffSrc[key][0].op != "add" && diffDst[key][0].op != "add")) {
                if (diffSrc[key] && diffDst[key]) {
                    sortedDiff.conflicts[key] = [diffSrc[key], diffDst[key]];
                }
            }
        } else if (typeof diffDst[key] !== 'undefined') {
            sortedDiff.nonConflicts[key] = diffDst[key];
        } else if (typeof diffSrc[key] !== 'undefined') {
            sortedDiff.nonConflicts[key] = diffSrc[key];
        }
    });
    return sortedDiff;
    /*var diffOfTheseDiffs = compareDiffFct(diffSrc, diffDst);
    let keys = Object.keys(diffOfTheseDiffs);
    let sortedDiff = {};
    sortedDiff.conflicts = {};
    sortedDiff.nonConflicts = {}
    keys.forEach((key) => {
        // if both elements are defined there is a conflict
        if ((diffOfTheseDiffs[key][1] && diffOfTheseDiffs[key][0])) {
            sortedDiff.conflicts[key] = diffOfTheseDiffs[key];
        } else if (diffOfTheseDiffs[{
            sortedDiff.nonConflicts[key] =
        }
    });
    return conflictedElements;*/
}

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