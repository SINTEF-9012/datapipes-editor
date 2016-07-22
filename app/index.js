(function() {
  angular
      .module('bigmlEditor', [])
      .controller('editor',['$scope','bigmlComponents', function(scope,components) {
        scope.jointGraph = new joint.dia.Graph();
        scope.componentsList = components;
        scope.propertyEditorElement = [1, 2];
      }]);
})();