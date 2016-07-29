(function () {
    angular
        .module('bigmlEditor', ['ngFileSaver'])
        .config(['$compileProvider',
            function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
            }])
        .controller('editor', ['$scope', 'bigmlComponents', 'FileSaver', 'Blob', MainCtrlFct]);

        function MainCtrlFct (scope, components, FileSaver, Blob) {
            // Variables added to scope
            scope.jointGraph = new joint.dia.Graph();
            scope.componentsList = components;
            scope.propertyEditorElement = [1, 2];
            scope.jsonImport = "";
            // Functions
            scope.exportDiagram = exportDiagramFct;
            scope.importDiagram = importDiagramFct;
            function exportDiagramFct() {
                var content = scope.jointGraph.toJSON();
                var data = new Blob([JSON.stringify(content)], {type: 'application/json;charset=utf-8'});
                FileSaver.saveAs(data, 'bigml_graph.json');
            }

            function importDiagramFct() {
                console.log("Importing JSON");
                console.log(scope.jsonImport);
                scope.jointGraph.fromJSON(JSON.parse(scope.jsonImport));
            }
        }
})();