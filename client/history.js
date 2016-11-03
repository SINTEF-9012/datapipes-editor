import { Template } from 'meteor/templating';

import { Version } from '/imports/synchronization/version.js';
import { Branch } from '/imports/synchronization/branch.js'

Template.historygraph.helpers({
  commitlist() {
    var branches = Branch.find({}).fetch(),
        versions = branches.reduce((r,b) => { b.versions.forEach(v => r[v._id._str] = { branch: b, version: v }); return r }, {}),
        master = branches.find(b => b._id == 'master'),
        root = master.versions.find(v => v.previous == null);
    
    // Make map based on previous id
    var prevmap = {},
        mergemap = {};
    for (i in versions) {
      var prev = versions[i].version.previous;
      if (prev && prevmap[prev._str]) prevmap[prev._str].push(versions[i]);
      else if (prev) prevmap[prev._str] = [ versions[i] ];
      
      var merge = versions[i].version.mergedFrom;
      if (merge && mergemap[merge._str]) mergemap[merge._str].push(versions[i]);
      else if (merge) mergemap[merge._str] = [ versions[i] ];
    }
    
    // Make list of entries based on what has happened
    var list = [{ op: 'root', col: 0, id: root._id._str, branch: master, version: root }];
    var makeTree = function(start) {
      console.log(prevmap[start.id],mergemap[start.id]);
    };
    makeTree(list[0]);
    
    
    //console.log('Commits: ',versions,prevmap,mergemap);
    //console.log('List: ',list,prevmap[root._id._str]);
  }
});