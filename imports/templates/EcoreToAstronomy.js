import { Ecore } from 'ecore/dist/ecore.xmi';

var fs = Npm.require('fs');
var DustJS = Npm.require("dustjs-helpers");

function loadDustTemplate(name) {
    var template = fs.readFileSync(process.cwd().split('.meteor')[0] + "imports/templates/" + name + ".dust", "UTF8").toString(), compiledTemplate = DustJS.compile(template, name);
    DustJS.loadSource(compiledTemplate);
}


//Load the DUST template
loadDustTemplate('ClassWithoutInheritance');
loadDustTemplate('ClassInherited');

//Load ecore file (XMI)
var fileContents = fs.readFileSync(process.cwd().split('.meteor')[0] + 'resources/BigML-metamodel.ecore', 'utf8');
var resourceSet = Ecore.ResourceSet.create();
var resource = resourceSet.create({uri: '/resources/BigML-metamodel.ecore'});

try {
    //Parse the XMI: we have objects now
    resource.parse(fileContents, Ecore.XMI);
    //Get the root
    var ePackage = resource.get('contents').first();
    //The model that will contain the data to fill the template
    var model = {};
    //We go through all the concept that compose the MM and compute model
    ePackage.get('eClassifiers').map(function (c) {
        model.elementName = c.get('name');

        //We retrieve the information related to the attributes
        model.attributes = [];
        var attribute = {};
        if (c.get('eStructuralFeatures').size() > 0) {
            c.get('eStructuralFeatures').map(function (f) {
                attribute.attributeName = f.get('name');
                var eType = f.get('eType').get('name');
                if (f.isTypeOf('EReference')) {
                    attribute.type = eType;
                    attribute.default = "default() { return []; }"
                } else {
                    attribute.default = "default: ''"
                    if (eType == 'EString') {
                        attribute.type = "String";
                    } else {
                        attribute.type = "Boolean";
                    }
                }

            });

            //To select the type of template we are looking for
            var typeTemplate = "";
            if (c.get('eSuperTypes').size() > 0) {
                c.get('eSuperTypes').map(function (s) {
                    model.parentClass = s.get('name');
                });
                typeTemplate = "ClassInherited";
            } else {
                typeTemplate = "ClassWithoutInheritance";
            }
            model.attributes.push(attribute);

            //We fill the template
            DustJS.render(typeTemplate, model, function (err, out) {
                if (err != null) {
                    console.error(err);
                    process.exit(1);
                }
                else {
                    console.log(out);
                }
            });
        }
    });


} catch (err) {
    console.log('*** Failed parsing metamodel');
    console.trace(err);
}
