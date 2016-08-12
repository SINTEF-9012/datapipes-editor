import { Template } from 'meteor/templating';

import { BigmlComponent } from '/imports/components/basic.js';

import '/imports/components/database.html';


class BigmlDatabase extends BigmlComponent {
  constructor(options) {
    super(options);
    
    this.type = 'bigml.database';
    this.template = 'components.bigml.database';
    
    this.properties.push({ name: 'URL', type: 'string', default: '' });
  }
}
Template['components.bigml.database'].helpers({
  svgAttributes() {
    return {
      x: this.attributes.x-this.attributes.width/2,
      y: this.attributes.y-this.attributes.height/2,
      width: this.attributes.width,
      height: this.attributes.height
    };
  }
});


export { BigmlDatabase };