import { Template } from 'meteor/templating';
import { Notification, Status } from '/imports/notifications/notifications.js';
import { Branch } from '/imports/synchronization/version.js';
import { selectedBranch } from '/client/branch.js';
import { PopupShow } from '/client/popups/popups.js';

Template.notification.events({
    'click .close-button'(event) {
        console.log("close");
        console.log(this._id);
        var id = this._id;
        var notif = Notification.findOne(id);
        notif.read = true;
        notif.save();
        $("#"+id).fadeOut();
    },
    'click .merge'(event) {
        let conflicts = Branch.findOne(selectedBranch.get()).pull();
        PopupShow('merge', conflicts);
    },

});
Template.notification.helpers({
    timelapse() {
        var timelapse = Math.round((Session.get("time") -this.timestamp)/60000);
        if (timelapse < 0) {
            return 0;
        } else return timelapse;
    },
    status() {
        return Status.getIdentifier(this.status);
    },
    isActionType() {
        return this.status == 0;
    }
});

Meteor.setInterval(function() {
    Session.set("time", new Date());
}, 60000);

Template.notificationContainer.helpers({
    notifications() {
        // We listen to master in order to know when a new version is available
        var query = Branch.find({_id: "master"});
        query.observeChanges({
            added: function(id, fields) {
                console.log("new branch");
            },
            changed: function (id, fields) {
                console.log("Changed : new version");
                var notif = new Notification();
                notif.description = "new master version, do you want to pull now ?";
                notif.status = 0;
                notif.save();
            }
        });

        // return our notifications sorted by date
        return Notification.find({},{ sort: { createdAt: -1 } });
    }
});