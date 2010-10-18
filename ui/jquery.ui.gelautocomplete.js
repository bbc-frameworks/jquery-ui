/*
 * BBC jQuery UI Gelautocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 *	jquery.ui.autocomplete.js
 */

/**
 * JsDoc stuff about the $('.class').gelautocomplete()
 * method to go here ...
 */
(function( $ ) {
    
    $.widget( "ui.gelautocomplete", $.ui.autocomplete, {
        /**
        * (this should go in the JSDoc stuff above)
        * Adds an extraWidth option for autocomplete, which
        * makes the menu larger (or smaller) than the input.
        * 
        * This is useful where you have a button that appears
        * to be part of the text field, as with barlesque's
        * search field.
        */
        options : {
            extraWidth : 0
        },
        /**
         * Overrides the _suggest method of autocomplete
         * to account for padding by using outerWidth and
         * an "extraWidth" option passed to constructor.
         * 
         * Code comes from github, should be the default in
         * the next version of jQuery UI, minus the
         * extraWidth bit.
         * 
         * @private
         * @param Array items list of items to display
         * @returns void
         */
        _suggest: function( items ) {
            $.ui.autocomplete.prototype._suggest.apply(this, arguments);
            var ul = this.menu.element;
            menuWidth = ul.width( "" ).outerWidth();
            textWidth = this.element.outerWidth() + this.options.extraWidth;
            ul.width( Math.max( menuWidth, textWidth )
                - ( parseFloat( ul.css("paddingLeft") ) || 0 )
                - ( parseFloat( ul.css("paddingRight") ) || 0 )
                - ( parseFloat( ul.css("borderLeftWidth") ) || 0 )
                - ( parseFloat( ul.css("borderRightWidth") ) || 0 ) );
        }
    });


}( jQuery ));
