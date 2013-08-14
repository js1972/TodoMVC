/* 
 * Performs no UI logic and therefore has no references to UI controls.
 * Accesses and modifies model and relies on data binding to inform UI about changes.
 * 
 * Other than data binding between view and model we have two discrete, mockable
 * functions to tell the view about changes: changeSelection(), postMessage().
 * 
 * Routing: Routing links the web-site URL with the application state. Here we are
 * using the popular director.js framework for client-side routing. It means that 
 * the state of the application can be saved in favourites for example.
 * 
 * EventBus - We use the sapui5 EventBus as a proof of concept here - its not really 
 * needed and just provides another layer of abstraction. The EventBus is ideally 
 * suited to communication between views (mobile apps).
 * The EventBus just helps us subscribe to path change events for routing. We could
 * have easily just called onPathChange() directly! 
 */

jQuery.sap.registerModulePath("vendor", "scripts/vendor");

jQuery.sap.require("scripts.utils.TodoPersistency");
jQuery.sap.require("vendor.director");
jQuery.sap.require("sap.ui.core.EventBus");

sap.ui.controller("scripts.todoController", {

    // Stores todos permanently via HTML5 localStorage
    store: new utils.TodoPersistency("todos"),

    // Stores todos for the duration of the session
    model: null,

    // Retrieve the todos from the store and initialise the model
    onInit: function() {
        this.model = new sap.ui.model.json.JSONModel(this.store.isEmpty() ? this.store.set({ todos: [] }).get() : this.store.get());
        this.getView().setModel(this.model);
        
        // Initialise ui5 EventBus and director.js routing ->
        
        // Subscribe to path change event
        sap.ui.getCore().getEventBus().subscribe('todo', 'pathChange', this.onPathChange, this);
        
        // Initialise router setting handler
        Router({ "/:filter": this.routeListener }).init("all");
    },

    // Create a new todo
    createTodo: function(todo) {
        if (!todo.trim()){
            return;
        }
        
        // Overwrite the todos in the model with the current todos appended with the new todo
        this.model.setProperty("/todos/", this.model.getProperty("/todos/").push({
            "id": Date.now(),
            "done": false,
            "text": todo.trim()
        }));
 
        this.store.set(this.model.getData());
        this.model.updateBindings(true);
    },

    // Complete / reopen a todo
    todoToggled: function(todo) {
        var text = todo.getProperty("text");
        var done = todo.getProperty("done");

        this.store.set(this.model.getData());

        // In case there are things we can't get done via data binding, we
        // introduce a thin message to the view we can call (MVP style)
        this.getView().postMessage("'" + text + "' was " + (done? "completed" : "reopened"));

        this.model.updateBindings(true);
    },

    // Re-name a todo
    todoRenamed: function(todo) {
        this.store.set(this.model.getData());
        this.model.updateBindings(true);
    },

    routeListener: function(route) {
        // Publish path change event
        sap.ui.getCore().getEventBus().publish('todo', 'pathChange', { "path": route });
    },

    onPathChange: function(sChannelId, sEventId, oData) {
        this.todosSelected(oData.path);
    },
    
    // Change model filter based on selection
    todosSelected: function(selectionMode) {
        if (selectionMode === "all" || selectionMode === "") {
            this.getView().changeSelection(selectionMode || "all", []);
        } else if (selectionMode === "active") {
            this.getView().changeSelection(selectionMode, [new sap.ui.model.Filter("done", sap.ui.model.FilterOperator.EQ, false)]);
        } else if (selectionMode === "completed") {
            this.getView().changeSelection(selectionMode, [new sap.ui.model.Filter("done", sap.ui.model.FilterOperator.EQ, true)]);
        }
    },

    // Permanently remove completed todos from the model
    removeCompleted: function() {
        "use strict";
        var todos = this.model.getData().todos;

        //if (jQuery.isArray(todos)) {
        //    new sap.ui.commons.MessageBox.alert("Is Array!");
        //}

        // Iterate in reverse as we are editing the array
        var len = todos.length;
        while (len--) {
            if (todos[len].done === true) {
                todos.splice(len, 1);
            }
        }

        this.model.updateBindings(true);
        this.store.set(this.model.getData());
 
        this.getView().postMessage("Completed items deleted");
    }
});