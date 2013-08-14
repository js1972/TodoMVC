/*
 * Counts the number of open todos
 */

jQuery.sap.declare("utils.openTodoCountFormatter");

utils.openTodoCountFormatter = function(aTodos) {
	var numberOfOpenItems = 0;
	aTodos.forEach(function(todo) {
		if (todo.done === false) {
			numberOfOpenItems++;
		}
	});
	
	return numberOfOpenItems === 1 ? "1 item left" : numberOfOpenItems + " items left";
};