angular
    .module('bigmlEditor')
    .directive('componentListElement', ['jointjsDragDrop', toolboxElement]);

function toolboxElement (dragdrop) {
    return {
        template: '<img ng-if="component.icon" ng-src="{{ component.icon }}" alt="{{ component.text }}"> {{ component.text }}',
        link: function(scope, elem) {
            elem.attr('draggable','true');

            // This code is used to have a preview of the element dragged
            elem.on('dragstart', function(e) {
                e.originalEvent.dataTransfer.setData('bigmlComponent',scope.component.dragId);
                var icon = dragdrop.getIconElement(scope.component.dragId);
                if (icon) e.originalEvent.dataTransfer.setDragImage(icon.icon, icon.xOffset, icon.yOffset);
            });
            elem.css('cursor','pointer');
        }
    };
}
