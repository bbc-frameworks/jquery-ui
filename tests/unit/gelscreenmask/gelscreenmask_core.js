/*
 * gelscreenmask_core.js
 */

(function($) {

module('gelscreenmask: core');

test('create: returns the element', function() {
	expect(1);
	var mask = $('.box-1').gelscreenmask();
	mask.gelscreenmask('open');
	equals( mask.selector, '.box-1', 'creating the mask should return the element');
	mask.gelscreenmask('destroy');
});

test('open: shows the element above the mask', function() {
	expect(3);
	var mask = $('.box-1').gelscreenmask();
	mask.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('display'), 'block', 'opening a mask should show the overlay element');
	equals( $('.box-1').css('display'), 'block', 'opening a mask should show the element');
	var elementZIndex = $('.box-1').css('zIndex');
	var maskZIndex    = $('.ui-widget-gelscreenmask').css('zIndex');
	equals( elementZIndex-1, maskZIndex, 'element should have a zIndex that is 1 higher than the overlay mask');
	mask.gelscreenmask('destroy');
});

test('flash: test flash elements after open/close/destroy of one mask', function() {
	expect(7);
	var mask1 = $('.box-1').gelscreenmask();

	//check the default are set up correctly
	equals($('object:hidden' ).length, 4, "this amount of flash object should not be visible");
	equals($('object:visible').length, 1, "this amount of flash object should be visible");
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should not be visible");

	mask1.gelscreenmask('open');
	equals($('.box-1 object:visible').length, 1, ".box 1 flash element should now be visible");
	mask1.gelscreenmask('close');
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should now be visible");
	mask1.gelscreenmask('open');
	equals($('.box-1 object:visible').length, 1, ".box 1 flash element should now be visible");
	mask1.gelscreenmask('destroy');
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should now be visible");
});

test('flash: test flash elements after open/close/destroy of mulitple masks', function() {
	//different browsers use object/embed accordingly..
});

test('options: hideElement', function() {
	expect(3);
	var mask = $('.box-1').gelscreenmask();
	equals( $('.box-1:hidden').length, 1, '.box-1 element should be hidden by default');
	mask.gelscreenmask('destroy');
	
	//show element for the next assertion
	$('.box-1').css('display', 'block');
	var mask = $('.box-1').gelscreenmask({hideElement: false});
	equals( $('.box-1').css('display'), 'block', '.box-1 element should not have been hidden');
	mask.gelscreenmask('destroy');
	equals( $('.box-1').css('display'), 'block', 'destroy method should set to previous display');
	//unshow to reset
	$('.box-1').css('display', 'none');
});

test('zIndexes: passing a negative should fail', function() {
	expect(2);
	try {
		var mask = $('.box-1').gelscreenmask({zDiff: -10});
	} catch(e) {
		equals( true, true, 'this throw should always happen');
	}
	equals($('.box-1').data('gelscreenmask'), undefined, 'widget should not have been created' )
});

test('zIndexes: defaults', function() {
	expect(6);
	var mask = $('.box-1').gelscreenmask();
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	mask.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('zIndex'), 5, '.ui-widget-gelscreenmask should have default zIndex increment' );
	equals( $('.box-1').css('zIndex'), 6, 'this element should have a z-index that is 1 higher than .ui-widget-gelscreenmask and static zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 5, 'static zIndex counter $.ui.gelscreenmask.zIndex should be at default increment' );
	mask.gelscreenmask('destroy');
	equals( $('.box-1').css('zIndex'), 1, 'after destroying, the mask .box-1 should have returned to its previous zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 0, 'after destroying, the static zIndex counter should have returned to previous state' );
});

test('zIndexes: with setters', function() {
	expect(6);
	var mask = $('.box-1').gelscreenmask({zDiff: 10});
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	mask.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('zIndex'), 10, '.ui-widget-gelscreenmask should have a zIndex the same as the zDiff' );
	equals( $('.box-1').css('zIndex'), 11, 'this element should have a z-index that is 1 higher than .ui-widget-gelscreenmask and static zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 10, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the same as the zDiff' );
	mask.gelscreenmask('destroy');
	equals( $('.box-1').css('zIndex'), 1, 'after destroying, the mask .box-1 should have returned to its previous zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 0, 'after destroying, the static zIndex counter should have returned to previous state' );
});

test('zIndexes: with more than one dialog created, stack zIndexes properly', function() {
	expect(9);
	var mask1 = $('.box-1').gelscreenmask({zDiff: 15});
	var mask2 = $('.box-2').gelscreenmask(); // will default to increment of 5
	var mask3 = $('.box-3').gelscreenmask({zDiff: 3});

	mask1.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('zIndex'), 15, '.ui-widget-gelscreenmask should have a zIndex the same as the zDiff' );
	equals( $('.box-1').css('zIndex'), 16, 'this element should have a z-index that is 1 higher than .ui-widget-gelscreenmask and static zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 23, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 15+5+3' );

	mask2.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('zIndex'), 20, '.ui-widget-gelscreenmask should have a zIndex the same as the zDiff' );
	equals( $('.box-2').css('zIndex'), 21, 'this element should have a z-index that is 1 higher than .ui-widget-gelscreenmask and static zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 23, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 15+5+3' );

	mask3.gelscreenmask('open');
	equals( $('.ui-widget-gelscreenmask').css('zIndex'), 23, '.ui-widget-gelscreenmask should have a zIndex the same as the zDiff' );
	equals( $('.box-3').css('zIndex'), 24, 'this element should have a z-index that is 1 higher than .ui-widget-gelscreenmask and static zIndex' );
	equals( $.ui.gelscreenmask.zIndex, 23, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 15+5+3' );

	mask1.gelscreenmask('destroy');
	mask2.gelscreenmask('destroy');
	mask3.gelscreenmask('destroy');
});

test('zIndexes: with more than one dialog created, \'open\' then \'close\' restores default zIndexes and leaves static zIndex untouched', function() {
	expect(4);
	var mask1 = $('.box-1').gelscreenmask({zDiff: 15});
	var mask2 = $('.box-2').gelscreenmask(); // will default to increment of 5
	var mask3 = $('.box-3').gelscreenmask({zDiff: 3});

	//open and close in random order
	mask3.gelscreenmask('open');
	mask1.gelscreenmask('open');
	mask2.gelscreenmask('open');
	mask1.gelscreenmask('close');
	mask3.gelscreenmask('close');
	mask2.gelscreenmask('close');

	//previous Zindex state restored
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	equals( $('.box-2').css('zIndex'), -10, 'this element should have a z-index of -10 specified from the CSS (pre open())' );
	equals( $('.box-3').css('zIndex'), 0, 'this element should have a z-index of 0 because none has been set' );
	
	//static index should be untouched
	equals( $.ui.gelscreenmask.zIndex, 23, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 15+5+3' );
	
	mask1.gelscreenmask('destroy');
	mask2.gelscreenmask('destroy');
	mask3.gelscreenmask('destroy');
});

test('zIndexes: with more than one dialog created, \'destroy\' decrements static zIndex count', function() {
	expect(3);
	var mask1 = $('.box-1').gelscreenmask({zDiff: 15});
	var mask2 = $('.box-2').gelscreenmask(); // will default to increment of 5
	var mask3 = $('.box-3').gelscreenmask({zDiff: 3});

	//open and close in random order
	mask1.gelscreenmask('open');
	mask2.gelscreenmask('open');
	mask3.gelscreenmask('open');
	mask1.gelscreenmask('close');
	mask3.gelscreenmask('close');
	mask2.gelscreenmask('close');

	//destroying the mask (randomly) decrements the static count
	mask3.gelscreenmask('destroy');
	equals( $.ui.gelscreenmask.zIndex, 20, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 15+5' );
	mask1.gelscreenmask('destroy');
	equals( $.ui.gelscreenmask.zIndex, 5, 'static zIndex counter $.ui.gelscreenmask.zIndex should be the addition of 5' );
	mask2.gelscreenmask('destroy');
	equals( $.ui.gelscreenmask.zIndex, 0, 'static zIndex counter $.ui.gelscreenmask.zIndex should have been reset to default' );
});

})(jQuery);