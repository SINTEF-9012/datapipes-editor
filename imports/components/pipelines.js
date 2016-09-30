import { Template } from 'meteor/templating';

Template.bigml_pipeline_arrow.helpers({
  path() {
    return 'M '+this.start.x+','+this.start.y+' L '+this.end.x+','+this.end.y;
  }
});

Template.bigml_pipeline_preview.helpers({
  visible() {
    var visible = this.get().visible;
    return visible == undefined ? true : !!visible;
  },
  pipeline() {
    return this.get();
  }
});

Template.bigml_pipeline.helpers({
  pipeline() {
    var canvas = Template.instance().findParentTemplate('canvas');
    var version = canvas.data.version;
    
    var start = version.getPortPosition(this.outputPort);
    var end = version.getPortPosition(this.inputPort);
    
    return {
      start: start,
      end: end
    };
  }
});