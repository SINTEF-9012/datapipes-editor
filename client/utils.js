/**
 * Get the parent template instance
 * @param {Number} [levels] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.parentTemplate = function (levels) {
  var view = this.view;
  if (typeof levels === "undefined") {
    levels = 1;
  }
  while (view) {
    if (view.name.substring(0, 9) === "Template." && !(levels--)) {
      return view.templateInstance();
    }
    view = view.parentView;
  }
};

/**
 * Get parent template instance by name
 * @param {String} [name] The name of the parent template to find
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.findParentTemplate = function (name) {
  var parent = this.parentTemplate(1);
  while (parent && parent.view.name !== "Template."+name) {
    parent = parent.parentTemplate(1);
  }
  return parent;
};




/* --- Attach function on mousemove until mouseup or mouseout of parent element --- */
var attachMouseMove = function(parent, callback) {
  var mouseup, mouseout;
  
  // Detach on mouseup
  mouseup = function(e) {
    parent.removeEventListener('mousemove', callback);
    parent.removeEventListener('mouseup', mouseup);
    parent.removeEventListener('mouseout', mouseout);
  };
  parent.addEventListener('mouseup',mouseup);
  
  // Detach on mouseout
  mouseout = function(e) {
    if (!parent.contains(e.toElement)) {
      parent.removeEventListener('mousemove', callback);
      parent.removeEventListener('mouseup', mouseup);
      parent.removeEventListener('mouseout', mouseout);
    }
  };
  parent.addEventListener('mouseout', mouseout);
  
  // Add callback
  parent.addEventListener('mousemove', callback);
};


export { attachMouseMove };