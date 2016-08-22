import {Ecore} from 'ecore/dist/ecore.xmi';
import {Class} from 'meteor/jagi:astronomy';

var fs = Npm.require('fs');
var DustJS = Npm.require("dustjs-helpers");

// Keep line breaks
//DustJS.optimizers.format = function (ctx, node) { return node; };

function loadDustTemplate(name) {
    var template = fs.readFileSync(process.cwd().split('.meteor')[0] + "imports/templates/" + name + ".dust", "UTF8").toString(), compiledTemplate = DustJS.compile(template, name);
    DustJS.loadSource(compiledTemplate);
}


//Load the DUST template
loadDustTemplate('ClassWithoutInheritance');
loadDustTemplate('ClassInherited');
loadDustTemplate('Export');

//Load ecore file (XMI)
var fileContents = fs.readFileSync(process.cwd().split('.meteor')[0] + 'resources/BigML-metamodel.ecore', 'utf8');
var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({uri: '/resources/BigML-metamodel.ecore'});
var result = "";

try {
    //Parse the XMI: we have objects now
    resource.parse(fileContents, Ecore.XMI);
    //Get the root
    var ePackage = resource.get('contents').first();
    //The map that contains all the models with inherited
    var mapInherited = new Map();
    //The map that contains all the models without inheritance
    var map = new Map();
    //We go through all the concept that compose the MM and compute model
    ePackage.get('eClassifiers').map(function (c) {

        //The model that will contain the data to fill the template
        var model = {};
        model.elementName = c.get('name');

        //We retrieve the information related to the attributes
        model.attributes = [];
        if (c.get('eStructuralFeatures').size() > 0) {
            c.get('eStructuralFeatures').map(function (f) {
                var attribute = {};
                attribute.attributeName = f.get('name');
                var eType = f.get('eType').get('name');
                if (f.isTypeOf('EReference')) {
                    attribute.type = "[" + eType + "]";
                    attribute.default = "default() { return []; }"
                } else {
                    if (eType == 'EString') {
                        attribute.type = "Boolean";
                        attribute.default = "default: false";
                    } else {
                        attribute.type = "Boolean";
                        attribute.default = "default: false";
                    }
                }
                model.attributes.push(attribute);
            });
        }

        //To select the type of template we are looking for
        if (c.get('eSuperTypes').size() > 0) {
            c.get('eSuperTypes').map(function (s) {
                model.parentClass = s.get('name');
            });
            mapInherited.set(model.elementName, model);
        } else {
            map.set(model.elementName, model);
        }

    });

    //First without inheritance
    map.forEach(function (elem) {
        //We fill the template
        DustJS.render("ClassWithoutInheritance", elem, function (err, out) {
            if (err != null) {
                console.error(err);
                process.exit(1);
            }
            else {
                result += out;
            }
        });
    });

    //Second with inheritance
    mapInherited.forEach(function (elem) {
        //We fill the template
        DustJS.render("ClassInherited", elem, function (err, out) {
            if (err != null) {
                console.error(err);
                process.exit(1);
            }
            else {
                result += out;
            }
        });
    });


    var elementsToExport = {};
    elementsToExport.elements = [];
    ePackage.get('eClassifiers').map(function (c) {
        var element = {};
        element.name = c.get('name');
        elementsToExport.elements.push(element);
    });

    DustJS.render('Export', elementsToExport, function (err, out) {
        if (err != null) {
            console.error(err);
            process.exit(1);
        }
        else {
            result += out;
        }
    });

    fs.writeFile(process.cwd().split('.meteor')[0] + 'imports/components/test.js', result, 'utf8',  function(err) {
        if (err) {
            throw (new Meteor.Error(500, 'Failed to save file.', err));
        } else {
            console.log('The file saved');
            import '/imports/components/test.js';
        }
    });

} catch (err) {
    console.log('*** Failed parsing metamodel');
    console.trace(err);
}
