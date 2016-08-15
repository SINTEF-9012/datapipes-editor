import { ReactiveVar } from 'meteor/reactive-var';
import { Type } from 'meteor/jagi:astronomy';

const propertiesElement = new ReactiveVar(undefined);

Template.rightbar.helpers({
  element() {
    return propertiesElement.get();
  },
  stowed() {
    if (propertiesElement.get())
      return "";
    else
      return "stowed";
  },
  fields() {
    var fields = Type.types[this.type].class.getScalarFields().reduce((arr, field) => {
      if (field.name != '_id' && field.name != 'type')
        arr.push(field);
      return arr;
    },[]);
    return fields;
  }
});

Template.formField.helpers({
  text(element, field) {
    return element[field.name];
  }
});

Template.formField.events({
  'keypress input, change input'(e, instance) {
    this.element[this.field.name] = instance.find('input').value;
    this.element.save();
  }
});

export { propertiesElement };