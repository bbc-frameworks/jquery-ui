/*
 * BBC jQuery UI Geltexthint
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 *	jquery.ui.dialog.js
 */





(function( $ ) {

    $.widget( "ui.geltexthint", {
        options : {
            hint : "Type something ...",
            revertOnEmpty : true
        },
		
		/**
		 * @name jQuery.ui.geltexthint
		 * @constructor
		 * @description Add a gel text hint to a text input
		 * 
		 * @param {Object} opts Optional configuration settings.
		 * @param {Boolean} [opts.hint="Type something ..."] The hint to show by default
		 * @param {Number} [opts.revertOnEmpty=true] Should the input revert to the hint if the input is empty when blurred?
		 * 
		 */
        _create : function() {
            if ( this.element.val() == "" ) this._showHint();
            var self = this;
            this.element
                .bind("focus", function() {
                    var ele = $(this);
                    if ( ele.val() == self.options.hint ) {
                        self._hideHint();
                    }
                })
                .bind("blur", function() {
                    var ele = $(this);
                    if ( ele.val() == "" ) {
                        self._showHint();
                    }
                });
            this._showHint();
        },
		/**
		 * Shows the hint in the input, and adds the jquery ui "inactive" class
		 * @function
		 * @private
		 */
        _showHint : function() {
            this.element
                .val( this.options.hint )
                .addClass("ui-inactive");
        },
		/**
		 * Hides the hint (emptying the input), and removes the jquery ui "inactive" class
		 * @function
		 * @private
		 */
        _hideHint : function() {
            this
                .element.val( "" )
                .removeClass("ui-inactive");
        }
    });


}( jQuery ));