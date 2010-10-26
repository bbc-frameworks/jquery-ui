/*
 * gelmodal_core.js
 */

(function($) {

var geloverlay_style_html = '<div class="ui-geloverlay"><a href="#" class="ui-geloverlay-close">X</a><div class="ui-geloverlay-content"><input id="i1" /><input id="i2" tabindex="3" /><input id="i3" /></div></div>';

module('gelmodal: tabbing');

test('focuses the first tabbable element', function() {
	if ( document.activeElement ) {
		expect(1);
		var modal = $('.box-1').gelmodal();
		modal.gelmodal('open');
		
		equals(document.activeElement, $('.box-1 a.close')[0], 'first anchor is focused');
		modal.gelmodal('destroy');
	}
});

})(jQuery);
