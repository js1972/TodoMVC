// Enhanced text field that supports placeholder values and autofocus
// Note that getters and setters are automatically created for the control properties.
// Here we allow the TextField renderer to draw the control - we just set the
// placeholder attribute and focus.

jQuery.sap.declare("utils.SmartTextField");

jQuery.sap.require("sap.ui.core.Core", "sap.ui.commons.TextField");

sap.ui.commons.TextField.extend("utils.SmartTextField", {
	metadata: {
		properties: {
			"placeholder": "string",
			"autofocus": "boolean"
		}
	},
	renderer: {
		renderInnerAttributes: function(oRm, oTextField) {
			oRm.writeAttributeEscaped('placeholder', oTextField.getPlaceholder());
		}
	},
	onAfterRendering: function(e) {
		var $domRef = this.$();
		if (this.getProperty("autofocus")) {
			$domRef.focus();
		}
	}
});