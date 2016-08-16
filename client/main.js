import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Type } from 'meteor/jagi:astronomy';

import './main.html';

import { Branch, Version } from '/imports/synchronization/version.js';
import { BigmlComponent } from '/imports/components/basic.js';
import ComponentsList from '/imports/components/list.js';

/* Setup user accounts */
import { Accounts } from 'meteor/accounts-base';
 
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});


Template.toolbox.helpers({
  list() {
    var list = [];
    // Create a new component for the thumbnails, as long as we don't save(), it is not stored in the database
    ComponentsList.forEach((component) => {
      var temp = new component();
      if (temp instanceof BigmlComponent) {
        temp.location.x = 50;
        temp.location.y = 50;
        temp.location.width = 80;
        temp.location.height = 80;
        // Create a new id to aviod warnings about duplicate id's, even though this collection is not going to change
        temp._id = new Mongo.ObjectID;
        list.push(temp);
      }
    });
    return list;
  }
});


Template.toolboxthumbnail.events({
  'dragstart div'(event) {
    event.originalEvent.dataTransfer.setData('bigmlcomponent',this.type);
  }
});

Template.toolboxthumbnail.helpers({
  getTemplateName() {
    var type = Type.types[this.type];
    // Loop trough inheritance-chain to find a template to render
    while (type instanceof Type && !(Template[type.name] instanceof Template))
      type = Type.types[type.class.parentClassName];
    
    if (Template[type.name] instanceof Template)
      return type.name;
    else
      return undefined;
  }
});

Template.body.helpers({
  masterHead() {
    return Branch.getMasterHead();
  }
});