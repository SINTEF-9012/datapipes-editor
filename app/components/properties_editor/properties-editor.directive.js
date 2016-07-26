angular
    .module('bigmlEditor')
    .directive('componentPropertiesEditor', componentPropertiesEditor);


function componentPropertiesEditor() {
    return {
        templateUrl: './components/properties_editor/properties-editor.directive.html',
        link: function(scope, elem) {
            // Add functions to editor scope
            scope.showProperties = function(jointEl) {
                scope.$apply(function() {
                    scope.propertyEditorElement = jointEl;
                    console.log(jointEl);
                });
                elem.removeClass('stowed');
            };

            scope.hideProperties = function() {
                elem.addClass('stowed');
            };

            scope.removeElement = function () {
                scope.propertyEditorElement.remove();
            }
        }
    };
}