/*
 * Test runner  
 */
jQuery.sap.registerModulePath("scripts", "../scripts");
jQuery.sap.registerModulePath("utils", "../scripts/utils");
jQuery.sap.registerModulePath("vendor", "../scripts/vendor");

jQuery.sap.require("vendor.director");
jQuery.sap.require("utils.TodoPersistency");
jQuery.sap.require("utils.openTodoCountFormatter");
jQuery.sap.require({ modName : "scripts.todoController", type : "controller" });


module("Module test", {
    setup: function() {
        new utils.TodoPersistency("foo").remove();
    }
});

// Example test showing a simple module test
test("Set, get and delete via todo persistency", function() {
    var sut = new utils.TodoPersistency("foo");
    var dummy = {
        val: "val"
    };

    sut.set(dummy);
    var result = sut.get();
    sut.remove();

    ok(result.val === "val", "Value set and get okay");
    ok(sut.isEmpty() === true, "Value deleted okay");
});


var sut = {};
var sandbox;

module("Test routing", {
    setup: function() {
        new utils.TodoPersistency("todos").remove();
        sut = sap.ui.controller("scripts.todoController");
        
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getView").returns({
            setModel: function() {
            },
            postMessage: function() {
            },
            changeSelection: function(selMode, filters) {
                var activeFilter = JSON.stringify(new sap.ui.model.Filter("done", sap.ui.model.FilterOperator.EQ, false));
                ok(JSON.stringify(filters[0]) === activeFilter, "Routing logic working: Filter is active");
            }
        });
    },
    teardown: function() {
        sandbox.restore();
        sap.ui.getCore().getEventBus().unsubscribe('todo', 'pathChange', sut.onPathChange, sut);
        sut = {};
    }
});

test("Ensure filter is passed to view", function() {
    // Follow ui5 controller lifecycle by calling onInit()
    sut.onInit();
    
    // Trigger router listener
    sut.routeListener("active");
    //sut.onPathChange("todo", "pathChange", { "path": "active" });
});


module("Controller test", {
    setup: function() {
        new utils.TodoPersistency("todos").remove();
        sut = sap.ui.controller("scripts.todoController");
        
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getView").returns({
            setModel: function() {
            },
            postMessage: function() {
            }
        });
    },
    teardown: function() {
        sandbox.restore();
        sap.ui.getCore().getEventBus().unsubscribe('todo', 'pathChange', sut.onPathChange, sut);
        sut = {};
    }
});

// Example test showing how a controller can be tested
test("Create a single todo via the UI5 controller", function() {
    // Follow the UI5 controller lifecycle by calling onInit()
    sut.onInit();

    // Exercise
    sut.createTodo("foo");

    // Assert
    var todos = sut.model.getProperty("/todos/");
    equal(todos.length, 1, "Todo created");
    equal(todos[0].done, false, "Todo not done");
    equal(todos[0].text, "foo", "Todo text correct");
});


module("Controller test - whitespaces", {
    setup: function() {
        new utils.TodoPersistency("todos").remove();
        sut = sap.ui.controller("scripts.todoController");
        
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getView").returns({
            setModel: function() {
            },
            postMessage: function() {
            }
        });
    },
    teardown: function() {
        sandbox.restore();
        sap.ui.getCore().getEventBus().unsubscribe('todo', 'pathChange', sut.onPathChange, sut);
        sut = {};
    }
});

test("Trim todo", function() {
    // Follow ui5 controller lifecycle by calling onInit()
    sut.onInit();

    // Exercise
    sut.createTodo(" ");

    // Assert
    var todos = sut.model.getProperty("/todos");
    equal(todos.length, 0, "Blank values don't get saved");

    sut.createTodo("  Trim me ");
    equal(sut.model.getProperty("/todos/0/text"), "Trim me", "Todos get trimmed");
});


module("Test routing (again)", {
    setup: function() {
        new utils.TodoPersistency("todos").remove();
        sut = sap.ui.controller("scripts.todoController");
        
        sandbox = sinon.sandbox.create();
        sandbox.stub(sut, "getView").returns({
            setModel: function() {
            },
            postMessage: function() {
            },
            changeSelection: function(selMode, filters) {
                var activeFilter = JSON.stringify(new sap.ui.model.Filter("done", sap.ui.model.FilterOperator.EQ, false));
                ok(JSON.stringify(filters[0]) === activeFilter, "Routing logic working: Filter is active");
            }
        });
    },
    teardown: function() {
        sandbox.restore();
        sap.ui.getCore().getEventBus().unsubscribe('todo', 'pathChange', sut.onPathChange, sut);
        sut = {};
    }
});

test("Ensure filter is passed to view (again)", function() {
    // Follow ui5 controller lifecycle by calling onInit()
    sut.onInit();
    
    // Trigger router listener
    sut.routeListener("active");
    //sut.onPathChange("todo", "pathChange", { "path": "active" });
});
