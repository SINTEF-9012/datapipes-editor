(function () {
    angular
        .module('bigmlEditor', ['ngFileSaver'])
        .config(['$compileProvider',
            function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
            }])
        .controller('editor', ['$scope', 'bigmlComponents', 'FileSaver', 'Blob', MainCtrlFct]);

        function MainCtrlFct (scope, components, FileSaver, Blob) {
            scope.jointGraph = new joint.dia.Graph();
            scope.componentsList = components;
            scope.propertyEditorElement = [1, 2];
            scope.exportDiagram = exportDiagramFct;

            function exportDiagramFct() {
                var content = scope.jointGraph.toJSON();
                var data = new Blob([JSON.stringify(content)], {type: 'application/json;charset=utf-8'});
                FileSaver.saveAs(data, 'bigml_graph.json');
            }
        }
})();