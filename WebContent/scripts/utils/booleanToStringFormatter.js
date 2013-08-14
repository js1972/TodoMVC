/*
 * Converts booleans to strings
 */

jQuery.sap.declare("utils.booleanToStringFormatter");

utils.booleanToStringFormatter = function(value) {
	if (value === true)
		return "true";
	return "false";
};