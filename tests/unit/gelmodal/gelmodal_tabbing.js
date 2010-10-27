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
test('cycles forward after last edge element', function() {
	
});
test('cycles backward after first edge element', function() {
	
});
test('cycling forward works with flash at both ends', function() {
	
});
test('cycling backward works with flash at both ends', function() {
	
});
test('obeys tabIndex without leaving modal', function() {
	
});
test('obeys tabIndex without leaving modal', function() {
	
});

test('allows tabbing into focusable flash', function() {
	
});


test('binds events on open', function() {
	
});
test('unbinds events on close', function() {
	
});



})(jQuery);
