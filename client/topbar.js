import { Template } from 'meteor/templating';
import { Class, Type } from 'meteor/jagi:astronomy';
import { Local, Elements } from '/imports/datastore';

var state;
Template.topbar.events({
    'click #monitor-mode-button'(event) {
        "use strict";
        var att = document.createAttribute("disabled");        // Create a "href" attribute
        att.value = "disabled";
        document.getElementById('editor-mode-button').removeAttribute('disabled');
        $(event.target).attr('disabled', 'disabled');
        Session.set('state', 'monitor');
    },
    'click #editor-mode-button'(event) {
        "use strict";

        // update buttons view
        document.getElementById('monitor-mode-button').removeAttribute('disabled');
        $(event.target).attr('disabled', 'disabled');

        if (Local.find().count() == 0 ) {
            Local.loadContent();
        }
        // set state to editor (in order to notify other modules)
        Session.set('state', 'editor');

    },
    'click #save-button'(e) {
        e.preventDefault();
        $('#commitModal').modal('show');
    }
});

Template.commitNameModalTemplate.events({
    'click #commitOnly': function(e) {
        e.preventDefault();
        var name = $('#commitOwnerName').val();
        var description = $('#commitDescription').val();
        Local.commit(name);
        $('#commitModal').modal('hide');
    },
    'click #merge': function(e) {
        e.preventDefault();
        var name = $('#commitOwnerName').val();
        var description = $('#commitDescription').val();
        Local.merge(name);
        $('#commitModal').modal('hide');
    }
});