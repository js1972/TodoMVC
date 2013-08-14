/* 
 * Does all UI-related things like creating controls, data binding configuration, 
 * setting up callbacks, etc. Does not perform any business logic.  
 */

jQuery.sap.require("scripts.utils.SmartTextField");
jQuery.sap.require("scripts.utils.booleanToStringFormatter");
jQuery.sap.require("scripts.utils.openTodoCountFormatter");


sap.ui.jsview("scripts.todoView", {
    controls: [],
    repeater: false,
    messageNotifier: {},
    timerId: 0,
    todosSelection: {},

    getControllerName : function() {
        return "scripts.todoController";
    },

    createContent : function(oController) {
        "use strict";
        var layout = new sap.ui.commons.layout.MatrixLayout("matrixLayout", { layoutFixed: false }).setWidth("100%");

        //SmartTextField for entering a new todo
        var newTodo = new utils.SmartTextField("new-todo", {
            placeholder: "What needs to be done?",
            autofocus: !$.browser.msie,
            width: "60%"
        }).attachChange(function() {
            oController.createTodo(this.getProperty("value"));
            this.setValue("");
        }); //.addStyleClass("create-todo");

        //this.controls.push(newTodo);
        layout.createRow(newTodo);

        //Row repeater that will hold our todos
        var todosRepeater = new sap.ui.commons.RowRepeater("todo-list", {
            design: sap.ui.commons.RowRepeaterDesign.Transparent,
            numberOfRows: 100
        });
        this.repeater = todosRepeater;

        // Complete flag that is later bound to the done status of a todo.
        // We attach this to each text field and write it to the DOM as a data-*
        // attribute; this way, we can refer to it in our stylesheet.
        var completedDataTemplate = new sap.ui.core.CustomData({
            key: "completed",
            value: {
                path: "done",
                formatter: utils.booleanToStringFormatter
            },
            writeToDom: true  
        });

        // Row repeater template - HORIZONTALLAYOUT is useless - can't specify widths of cells!
        var todoTemplate = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed: false,
            width: "100%",
            columns: 2,
            widths: ["0%", "100%"]
        });
        
        var templateCheckbox = new sap.ui.commons.CheckBox({
            checked: "{done}"
        }).attachChange(function() {
            oController.todoToggled(this.getBindingContext());
        });
        
        var templateTextField = new sap.ui.commons.TextField({
            value: "{text}",
            editable: false,
            width: "100%"
        }).attachBrowserEvent("dblclick", function(e) {
            this.setEditable(true);
        }).attachChange(function() {
            this.setEditable(false);
            oController.todoRenamed(this.getBindingContext());
        }).addStyleClass("todo").addCustomData(completedDataTemplate);

        todoTemplate.createRow(templateCheckbox, templateTextField);

        // Helper function to re-bind the aggregation with different filters
        // and to tell todosRepeater what template to use.
        todosRepeater.rebindAggregation = function(filters) {
            this.unbindRows();
            this.bindRows("/todos/", todoTemplate, null, filters);
        };

        // Initially we don't filter any todos
        todosRepeater.rebindAggregation([]);

        // this.controls.push(todosRepeater);
        layout.createRow(todosRepeater);

        // todo counter - uses the extended syntax to set binding. short syntax istext: "{company/name}"
        var todoCount = new sap.ui.commons.TextView("todo-count", {
            text: {
                path: "/todos/",
                formatter: utils.openTodoCountFormatter
            }
        });

        // Allow selecting which todos to show (with routing)
        var todosSelection = new sap.ui.commons.SegmentedButton("filters", {
            id: "TodosSelection",
            buttons: [  new sap.ui.commons.Button({
                            id: "all",
                            lite: true,
                            text: "All"
                        }),
                        new sap.ui.commons.Button({
                            id: "active",
                            lite: true,
                            text: "Active"
                        }),
                        new sap.ui.commons.Button({
                            id: "completed",
                            lite: true,
                            text: "Completed"
                        }) ]
        }).attachSelect(function(e) {
            Router.prototype.setRoute(e.getParameters().selectedButtonId);
            //oController.todosSelected(e.getParameters().selectedButtonId);
            $("#new-todo").focus();
        });
        todosSelection.setSelectedButton("all");
        this.todosSelection = todosSelection;

        
        var removeAllBtn = new sap.ui.commons.Button({
            text: "Remove completed",
            press: function() { oController.removeCompleted(); }
        });

        var todosFooter = new sap.ui.commons.layout.MatrixLayout("footer", {
            layoutFixed: false
        });
        todosFooter.createRow(todoCount, todosSelection, removeAllBtn);

        //this.controls.push(todosFooter);
        layout.createRow(todosFooter);


        //
        // Setup a notification bar (external to the view layout)
        //
        this.messageNotifier = new sap.ui.ux3.Notifier({
            title : "This is the MessageNotifier"
        });

        var notificationBar = new sap.ui.ux3.NotificationBar({
            display : displayListener,
            visibleStatus : "None",
            resizeEnabled : false
        });
        notificationBar.addStyleClass("sapUiNotificationBarDemokit");
        notificationBar.setMessageNotifier(this.messageNotifier);
        notificationBar.placeAt("notificationBar");
  
        // Notification bar callback for visibility
        function displayListener(oEvent) {
            var bShow = oEvent.getParameter("show");
            var sStatus = "";

            if (bShow) {
                sStatus = sap.ui.ux3.NotificationBarStatus.Default;
                notificationBar.setVisibleStatus(sStatus);
            } else {
                sStatus = sap.ui.ux3.NotificationBarStatus.None;
                notificationBar.setVisibleStatus(sStatus);
            }
        }

          
        this.controls.push(layout);
        return this.controls;
    },


    // This is an example for how the controller interacts with the view
    // only via a specific (mockable) interface.
    //
    // Post a message to the notification bar
    postMessage: function(message) {
        //$("#toaster").stop(true, true).text(message).fadeIn(100).delay(3000).fadeOut(500);

        var now = (new Date()).toUTCString();
        var oMessage = new sap.ui.core.Message({
            text: message,
            timestamp: now,
            level: sap.ui.core.MessageType.Information
        });

        // Clear any previous timer if still running
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.messageNotifier.removeAllMessages();
        this.messageNotifier.addMessage(oMessage);

        // Set a timeout to close the notification bar - note: must use a closure to 
        // access notification bar object
        var mn = this.messageNotifier;
        var delay = function() { mn.removeAllMessages(); };
        this.timerId = setTimeout(delay, 3000);
    },

    // Allow the controller to tell this view, which todosSelection button should
    // be selected.
    changeSelection: function(selMode, filters) {
        this.todosSelection.setSelectedButton(selMode);
        this.repeater.rebindAggregation(filters);
    }
});
