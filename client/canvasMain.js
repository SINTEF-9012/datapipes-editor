import { Template } from 'meteor/templating';

Template.canvasMain.helpers({
    getCanvasTemplateName() {
        // Kind of router between canvas depending of state
        if (Session.get('state') == "editor") {
            console.log('[INFO] canvasMain.js \t|\t Loading editor canvas');
            return "canvasEditor";
        } else {
            console.log('[INFO] canvasMain.js \t|\t Loading monitor canvas');
            return "canvasMonitor";
        }
    }
});