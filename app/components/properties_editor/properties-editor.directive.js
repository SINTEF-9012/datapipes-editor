angular
    .module('bigmlEditor')
    .directive('componentPropertiesEditor', componentPropertiesEditor);


function componentPropertiesEditor() {
    return {
        templateUrl: './components/properties_editor/properties-editor.directive.html',
        link: function(scope, elem) {
            scope.tmpPort = {};
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
            //
            //scope.addPort = function () {
            //    scope.propertyEditorElement
            //}

            scope.addPort = function(port) {
                scope.propertyEditorElement.addPort(port);
            };
            scope.removePort = function (port) {
                scope.propertyEditorElement.removePort(port);
                //var portsArray = scope.propertyEditorElement.get('outPorts');
                //console.log(portsArray);
                //var lg = portsArray.length;
                //for (var i = 0; i < lg; ++i) {
                //    console.log(portsArray[i]);
                //    if (port.id === portsArray[i]) {
                //        if (lg === 1) {
                //            scope.propertyEditorElement.set('outPorts', [])
                //        } else {
                //            portsArray.splice(i, 1);
                //            scope.propertyEditorElement.set('outPorts', portsArray);
                //        }
                //    }
                //}
               /* var index = portsArray.indexOf(port);
                if (index > -1)
                    portsArray.splice(index, 1);
                scope.propertyEditorElement.set('outPorts', portsArray);*/
               /* if (port.type == 'out') {
                    console.log('out');
                    scope.propertyEditorElement.removeOutPort(port.id);
                }
                else {
                    console.log('in');
                    scope.propertyEditorElement.removeInPort(port.id);
                }*/
            }
        }
    };
}