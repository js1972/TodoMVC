jQuery.sap.registerModulePath("scripts", "../scripts");
jQuery.sap.registerModulePath("vendor", "../scripts/vendor");

jQuery.sap.require("utils.TodoPersistency");
jQuery.sap.require("vendor.director");
jQuery.sap.require({ modName : "scripts.todoController", type : "controller" });


describe("Tests todo app modules", function() {
    
    describe("Test todo persistency", function() {
        it("Set, Get, Delete should work", function() {
            var sut = new utils.TodoPersistency("foo");
            var dummy = {
                val: "val"
            };

            sut.set(dummy);
            var result = sut.get();
            sut.remove();

            expect(result.val).toBe("val");
            expect(sut.isEmpty()).toBe(true);
        });
    });

    describe("Test controller", function() {
        var sut = {};
        var sandbox = {};
        var actualFilter = {}, activeFilter = {};
    
        beforeEach(function() {
            new utils.TodoPersistency("todos").remove();
            sut = sap.ui.controller("scripts.todoController");
                
            sandbox = sinon.sandbox.create();
            sandbox.stub(sut, "getView").returns({
                setModel: function() {
                },
                postMessage: function() {
                },
                changeSelection: function(selMode, filters) {
                    activeFilter = JSON.stringify(new sap.ui.model.Filter("done", sap.ui.model.FilterOperator.EQ, false));
                    //expect(JSON.stringify(filters[0])).toBe(activeFilter);
                    actualFilter = JSON.stringify(filters[0]);
                }
            });
        });
    
        afterEach(function() {
            sandbox.restore();
            sap.ui.getCore().getEventBus().unsubscribe('todo', 'pathChange', sut.onPathChange, sut);
            sut = {};
        });
    
        it("Can ceate a todo", function() {
            sut.onInit();
            sut.createTodo("foo");
        
            var todos = sut.model.getProperty("/todos/");
            expect(todos.length).toBe(1);
            expect(todos[0].done).toBe(false);
            expect(todos[0].text).toBe("foo");
        });
    
        it("Creating a todo ignores whitespace", function() {
            sut.onInit();
            sut.createTodo(" ");
        
            var todos = sut.model.getProperty("/todos");
            expect(todos.length).toBe(0);

            sut.createTodo("  Trim me ");
            expect(sut.model.getProperty("/todos/0/text")).toBe("Trim me");
        });
    
        it("Can be routed and uses EventBus", function() {
            spyOn(sut, "onPathChange").andCallThrough();
        
            sut.onInit();
            sut.routeListener("active");
            expect(sut.onPathChange).toHaveBeenCalled();
        });

        it("Is routed and sets correct Filter value", function() {
            expect(actualFilter).toBe(activeFilter);
        });
    });
});