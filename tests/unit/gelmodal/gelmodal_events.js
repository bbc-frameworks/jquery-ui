/*
 * gelmodal_core.js
 */

(function($) {

module('gelmodal: events');

test('open', function() {
	expect(2);
	var mask = $('.box-1').gelmodal();
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible before opening');
	mask.gelmodal('open');
	equals( 1, $('.box-1').filter(':visible').size(), 'modal contents are visible after opening');
	mask.gelmodal('destroy');
});

test('close', function() {
	expect(2);
	var mask = $('.box-1').gelmodal();
	mask.gelmodal('open');
	equals( 1, $('.box-1').filter(':visible').size(), 'modal contents are visible before closing');
	mask.gelmodal('close');
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible after closing');
	mask.gelmodal('destroy');
});

test('beforeopen', function() {
	expect(2);
	var mask = $('.box-1').gelmodal({beforeOpen:function(){return false;}});
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible before opening');
	mask.gelmodal('open');
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible when opening is cancelled');
	mask.gelmodal('destroy');
});

test('beforeclose', function() {
	expect(2);
	var mask = $('.box-1').gelmodal({beforeClose:function(){return false;}});
	mask.gelmodal('open');
	equals( 1, $('.box-1').filter(':visible').size(), 'modal contents are visible before closing');
	mask.gelmodal('close');
	equals( 1, $('.box-1').filter(':visible').size(), 'modal contents are visible when closing is cancelled');
	mask.gelmodal('option','beforeClose', function(){return true;});
	mask.gelmodal('close');
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible when closing is allowed');
	
});

})(jQuery);
