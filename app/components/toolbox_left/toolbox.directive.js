angular
    .module('bigmlEditor')
    .directive('toolboxLeft', ['jointjsDragDrop', toolboxElement]);

function toolboxElement (dragdrop) {
    return {
        templateUrl: "./components/toolbox_left/toolbox.directive.html",
        restrict: 'EA'
    };
}
