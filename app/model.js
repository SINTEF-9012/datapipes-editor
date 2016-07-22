var BASE_UNIVERSE = 0;
var BASE_TIME = 0;
var model;
var baseView;
var racine;

function initialize(graph) {
    //Initialize Model
    var dm = org.kevoree.modeling.memory.manager.DataManagerBuilder.buildDefault();
    model = new bigml.BigMLModel(dm);
    baseView = model.universe(BASE_UNIVERSE).time(BASE_TIME);
    model.connect(function (connect) {
        racine=baseView.createDataModel();
        
        addListener(graph);
        removeListener(graph);
    });
}

function addListener(graph) {
    graph.on('add', function (cell) {
        console.log(cell.attributes.type);
        //a big case to be added?!
        createDatabase();
    });
}

function removeListener(graph) {
    graph.on('remove', function (cell) {
        console.log(cell.attributes.type);
        //a big case to be added?!
    });
}


function createDatabase() {
    var database = baseView.createStorageSystem();
    database.setName("X");
    racine.addComponents(database);
    //Manage all properties here
    
    
    baseView.json().save(racine, function (modelStr) {
                console.log(modelStr);
            });
    
}