import { Template } from 'meteor/templating';

var calcRectAttributes = function(location) {
  return {
    x: location.x-location.width/2,
    y: location.y-location.height/2,
    width: location.width,
    height: location.height
  }
};

Template['bigml.component'].helpers({
  svgAttributes() { return calcRectAttributes(this.location); }
});

Template['bigml.compositecomponent'].helpers({
  svgAttributes() { return calcRectAttributes(this.location); }
});

Template['bigml.storagesystem'].helpers({
  svgAttributes() {
    return {
      cx: this.location.x,
      cy: this.location.y,
      r: (this.location.width+this.location.height)/4
    };
  }
});