/*
 * Main application javascript file. We have wrapped it in an immediate function
 * to provide the function-form of the "use strict" command.
 */

(function() {
    "use strict";

    sap.ui.localResources("scripts");

    // Setup an application shell and place the view inside
    var shell = new sap.ui.ux3.Shell("AppShell", {
        showSearchTool : false,
        showInspectorTool : false,
        showFeederTool : false,
        showLogoutButton : false
    });

    shell.addWorksetItem(new sap.ui.ux3.NavigationItem({
        key : "wiTodos",
        text : "Todos"
    }));

    var view = sap.ui.view({
        id : "idtodoView1",
        viewName : "scripts.todoView",
        type : sap.ui.core.mvc.ViewType.JS
    });

    shell.setContent(view);

    //view.placeAt("content");
    shell.placeAt("content");
}());