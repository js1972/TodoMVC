jQuery.sap.declare("utils.TodoPersistency");

/*
 * Commented out below is the original implementation by Harald Schubert @ SAP.
 * I have re-implemented this using the Module Pattern further below.
 * The difference is minor and I'm not sure if there is any benefit in either
 * approach over the other. My method is more true to the form of the pattern.
 * It's a module that returns a Constructor so that it can be called as such:
 * new todomvc.TodoPersistency("todos"). 
 */

//todomvc.TodoPersistency = function(aName) {
//	this.name = aName;
//};
//
//todomvc.TodoPersistency.prototype = (function() {
//	var storage = window.localStorage;
//
//	return {
//		get : function() {
//			return JSON.parse(storage.getItem(this.name));
//		},
//		set : function(data) {
//			return storage.setItem(this.name, JSON.stringify(data));
//		},
//		remove : function() {
//			storage.removeItem(this.name);
//			return this; // for method chaining
//		},
//		isEmpty : function() {
//			return !(this.get());
//		}
//	};
//}());

utils.TodoPersistency = (function(storage) {
    "use strict";

    // public API -- constructor
    var Constructor = function(aName) {
        this.name = aName;
    };

    // public API -- prototype
    Constructor.prototype = {
        constructor: utils.TodoPersistency,
        get: function() {
            return JSON.parse(storage.getItem(this.name));
        },
        set: function(data) {
            storage.setItem(this.name, JSON.stringify(data));
            return this;
        },
        remove: function() {
            storage.removeItem(this.name);
            return this; // for method chaining
        },
        isEmpty: function() {
            return !(this.get());
        }
    };

    // return the constructor
    return Constructor;
}(window.localStorage));