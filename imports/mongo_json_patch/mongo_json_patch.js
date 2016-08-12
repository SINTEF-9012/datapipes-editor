import { Mongo } from 'meteor/mongo';

if(!Object.keys) Object.keys = function(o){
    if (o !== Object(o))
        throw new TypeError('Object.keys called on non-object');
    var ret=[],p;
    for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
    return ret;
}

const driverJsonPatchMongo = {
    applyPatch: applyPatchFct,
};

function applyPatchFct(patch, targetCollection) {
    /*** Step 1 : Preprocessing ***/
    patch = transformPatch(patch);

    /*** Step 2 : update elements ***/
    // Get all keys of the hashmap
    const keys = Object.keys(patch);
    console.log(keys);
    keys.forEach((key) => {
        let requestset = {};
        patch[key].forEach((patchelem) => {
            if(patchelem.op == "add") {
                delete patchelem._id;
                targetCollection.insert( patchelem.value );
            } else if (patchelem.op == "replace") {
                requestset[patchelem.path] = patchelem.value;
            } else if (patchelem.op == "remove"){
                targetCollection.remove( key);
            } else {
                console.log("ELSE NOT IMPLEMENTED, SEE mongo_json_patch.js");
            }
        });
        if (requestset != {}) {
            targetCollection.update(
                { "_id": key},
                {
                    $set: requestset
                }
            );
        }
    });
}

function transformPatch(patch) {
    var patchSortedById = {};
    patch.forEach((operation) => {
        const tokens = operation.path.split("/");
        if (!patchSortedById[tokens[1]])
            patchSortedById[tokens[1]] = [];
        operation.path = tokens[2];
        for (var i = 3; i < tokens.length; ++i) {
            operation.path = operation.path +"." + tokens[i];
        }
        patchSortedById[tokens[1]].push(operation);
    });
    return patchSortedById;
}
export { driverJsonPatchMongo };