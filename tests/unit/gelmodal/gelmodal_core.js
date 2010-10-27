/*
 * gelmodal_core.js
 */

(function($) {

module('gelmodal: core');

test('create: returns the element', function() {
	expect(1);
	var mask = $('.box-1').gelmodal();
	mask.gelmodal('open');
	equals( mask.selector, '.box-1', 'creating the mask should return the element');
	mask.gelmodal('destroy');
});

test('open: shows the element above the mask', function() {
	expect(3);
	var mask = $('.box-1').gelmodal();
	mask.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('display'), 'block', 'opening a mask should show the overlay element');
	equals( $('.box-1').css('display'), 'block', 'opening a mask should show the element');
	var elementZIndex = $('.box-1').css('zIndex');
	var maskZIndex    = $('.ui-widget-gelmodal').css('zIndex');
	equals( elementZIndex-1, maskZIndex, 'element should have a zIndex that is 1 higher than the overlay mask');
	mask.gelmodal('destroy');
});

test('flash: test flash elements after open/close/destroy of one mask', function() {
	expect(7);
	var mask1 = $('.box-1').gelmodal();

	//check the default are set up correctly
	equals($('object:hidden' ).length, 4, "this amount of flash object should not be visible");
	equals($('object:visible').length, 1, "this amount of flash object should be visible");
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should not be visible");

	mask1.gelmodal('open');
	equals($('.box-1 object:visible').length, 1, ".box 1 flash element should now be visible");
	mask1.gelmodal('close');
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should now be visible");
	mask1.gelmodal('open');
	equals($('.box-1 object:visible').length, 1, ".box 1 flash element should now be visible");
	mask1.gelmodal('destroy');
	equals($('.box-1 object:visible').length, 0, ".box 1 flash element should now be visible");
});

test('flash: test flash elements after open/close/destroy of mulitple masks', function() {
	//different browsers use object/embed accordingly..
});

test('getStackLength: test stack length returns the correct number', function() {
	expect(5);
	var modal1 = $('<div></div>').gelmodal().gelmodal('open');
	var modal2 = $('<div></div>').gelmodal().gelmodal('open');
	var modal3 = $('<div></div>').gelmodal().gelmodal('open');
	var modal4 = $('<div></div>').gelmodal().gelmodal('open');
	equals( $.ui.gelmodal.maskStack.length, 4, 'opening 4 modals should return a length of 4');
	modal4.gelmodal('close');
	equals( $.ui.gelmodal.maskStack.length, 3, 'closing modal4 should return a length of 3');
	modal3.gelmodal('destroy');
	equals( $.ui.gelmodal.maskStack.length, 2, 'destroying modal3 should return a length of 2');
	var modal5 = $('<div></div>').gelmodal().gelmodal('open');
	equals( $.ui.gelmodal.maskStack.length, 3, 'opening modal5 should return a length of 3');

	modal1.gelmodal('destroy');
	modal2.gelmodal('destroy');
	modal4.gelmodal('destroy');
	modal5.gelmodal('destroy');

	equals( $.ui.gelmodal.maskStack.length, 0, 'destroying all should return a length of 0');
});

test('options: hideElement', function() {
	expect(5);
	var mask = $('.box-1').gelmodal();
	equals( $('.box-1:hidden').length, 1, '.box-1 element should be hidden by default');
	mask.gelmodal('open');
	equals( $('.box-1:hidden').length, 0, '.box-1 element should NOT be hidden after open');
	mask.gelmodal('destroy');
	
	//show element for the next assertion
	$('.box-1').css('display', 'block');
	var mask = $('.box-1').gelmodal({hideElement: false});
	equals( $('.box-1').css('display'), 'block', '.box-1 element should not have been hidden');
	mask.gelmodal('open');
	equals( $('.box-1:hidden').length, 0, '.box-1 element should NOT be hidden after open');
	mask.gelmodal('destroy');
	equals( $('.box-1').css('display'), 'block', 'destroy method should set to previous display');
	//unshow to reset
	$('.box-1').css('display', 'none');
});

test('zIndexes: passing a negative should fail', function() {
	expect(2);
	try {
		var mask = $('.box-1').gelmodal({zDiff: -10});
	} catch(e) {
		equals( true, true, 'this throw should always happen');
	}
	equals($('.box-1').data('gelmodal'), undefined, 'widget should not have been created' )
});

test('zIndexes: defaults', function() {
	expect(6);
	var mask = $('.box-1').gelmodal();
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	mask.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('zIndex'), 5, '.ui-widget-gelmodal should have default zIndex increment' );
	equals( $('.box-1').css('zIndex'), 6, 'this element should have a z-index that is 1 higher than .ui-widget-gelmodal and static zIndex' );
	equals( $.ui.gelmodal.zIndex, 5, 'static zIndex counter $.ui.gelmodal.zIndex should be at default increment' );
	mask.gelmodal('destroy');
	equals( $('.box-1').css('zIndex'), 1, 'after destroying, the mask .box-1 should have returned to its previous zIndex' );
	equals( $.ui.gelmodal.zIndex, 0, 'after destroying, the static zIndex counter should have returned to previous state' );
});

test('zIndexes: with setters', function() {
	expect(6);
	var mask = $('.box-1').gelmodal({zDiff: 10});
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	mask.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('zIndex'), 10, '.ui-widget-gelmodal should have a zIndex the same as the zDiff' );
	equals( $('.box-1').css('zIndex'), 11, 'this element should have a z-index that is 1 higher than .ui-widget-gelmodal and static zIndex' );
	equals( $.ui.gelmodal.zIndex, 10, 'static zIndex counter $.ui.gelmodal.zIndex should be the same as the zDiff' );
	mask.gelmodal('destroy');
	equals( $('.box-1').css('zIndex'), 1, 'after destroying, the mask .box-1 should have returned to its previous zIndex' );
	equals( $.ui.gelmodal.zIndex, 0, 'after destroying, the static zIndex counter should have returned to previous state' );
});

test('zIndexes: with more than one dialog created, stack zIndexes properly', function() {
	expect(9);
	var mask1 = $('.box-1').gelmodal({zDiff: 15});
	var mask2 = $('.box-2').gelmodal(); // will default to increment of 5
	var mask3 = $('.box-3').gelmodal({zDiff: 3});

	mask1.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('zIndex'), 15, '.ui-widget-gelmodal should have a zIndex the same as the zDiff' );
	equals( $('.box-1').css('zIndex'), 16, 'this element should have a z-index that is 1 higher than .ui-widget-gelmodal and static zIndex' );
	equals( $.ui.gelmodal.zIndex, 23, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 15+5+3' );

	mask2.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('zIndex'), 20, '.ui-widget-gelmodal should have a zIndex the same as the zDiff' );
	equals( $('.box-2').css('zIndex'), 21, 'this element should have a z-index that is 1 higher than .ui-widget-gelmodal and static zIndex' );
	equals( $.ui.gelmodal.zIndex, 23, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 15+5+3' );

	mask3.gelmodal('open');
	equals( $('.ui-widget-gelmodal').css('zIndex'), 23, '.ui-widget-gelmodal should have a zIndex the same as the zDiff' );
	equals( $('.box-3').css('zIndex'), 24, 'this element should have a z-index that is 1 higher than .ui-widget-gelmodal and static zIndex' );
	equals( $.ui.gelmodal.zIndex, 23, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 15+5+3' );

	mask1.gelmodal('destroy');
	mask2.gelmodal('destroy');
	mask3.gelmodal('destroy');
});

test('zIndexes: with more than one dialog created, \'open\' then \'close\' restores default zIndexes and leaves static zIndex untouched', function() {
	expect(4);
	var mask1 = $('.box-1').gelmodal({zDiff: 15});
	var mask2 = $('.box-2').gelmodal(); // will default to increment of 5
	var mask3 = $('.box-3').gelmodal({zDiff: 3});

	//open and close in random order
	mask3.gelmodal('open');
	mask1.gelmodal('open');
	mask2.gelmodal('open');
	mask1.gelmodal('close');
	mask3.gelmodal('close');
	mask2.gelmodal('close');

	//previous Zindex state restored
	equals( $('.box-1').css('zIndex'), 1, 'this element should have a z-index of 1 specified from the CSS (pre open())' );
	equals( $('.box-2').css('zIndex'), -10, 'this element should have a z-index of -10 specified from the CSS (pre open())' );
	equals( $('.box-3').css('zIndex'), 0, 'this element should have a z-index of 0 because none has been set' );
	
	//static index should be untouched
	equals( $.ui.gelmodal.zIndex, 23, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 15+5+3' );
	
	mask1.gelmodal('destroy');
	mask2.gelmodal('destroy');
	mask3.gelmodal('destroy');
});

test('zIndexes: with more than one dialog created, \'destroy\' decrements static zIndex count', function() {
	expect(3);
	var mask1 = $('.box-1').gelmodal({zDiff: 15});
	var mask2 = $('.box-2').gelmodal(); // will default to increment of 5
	var mask3 = $('.box-3').gelmodal({zDiff: 3});

	//open and close in random order
	mask1.gelmodal('open');
	mask2.gelmodal('open');
	mask3.gelmodal('open');
	mask1.gelmodal('close');
	mask3.gelmodal('close');
	mask2.gelmodal('close');

	//destroying the mask (randomly) decrements the static count
	mask3.gelmodal('destroy');
	equals( $.ui.gelmodal.zIndex, 20, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 15+5' );
	mask1.gelmodal('destroy');
	equals( $.ui.gelmodal.zIndex, 5, 'static zIndex counter $.ui.gelmodal.zIndex should be the addition of 5' );
	mask2.gelmodal('destroy');
	equals( $.ui.gelmodal.zIndex, 0, 'static zIndex counter $.ui.gelmodal.zIndex should have been reset to default' );
});

test('events: open', function() {
	expect(8);

	var el = $('<div></div>');
	el.gelmodal({
		open: function(ev, ui) {
			// theses shouldn't run because the open method is never called
			ok(el.data('gelmodal'), 'interal data is set');
			ok(true, 'autoOpen: true fires open callback');
			equals(this, el[0], 'context of callback');
			equals(ev.type, 'gelmodalopen', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	});
	el.remove();

	var el = $('<div></div>');
	el.gelmodal({
		open: function(ev, ui) {
			ok(true, '.gelmodal(\'open\') fires open callback');
			equals(this, el[0], 'context of callback');
			equals(ev.type, 'gelmodalopen', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	}).bind('gelmodalopen', function(ev, ui) {
		ok(el.data('gelmodal'), 'interal data is set');
		ok(true, 'gelmodal(\'open\') fires open event');
		equals(this, el[0], 'context of event');
		same(ui, {}, 'ui hash in event');
	});
	el.gelmodal('open')
	el.gelmodal('close');
	el.gelmodal('destroy');
	el.remove();
});

test("events: close", function() {
	expect(7);

	var el2 = $('<span></span>').gelmodal({
		close: function(ev, ui) {
			ok(true, '.gelmodal("close") fires close callback');
			equals(this, el2[0], "context of callback");
			equals(ev.type, 'gelmodalclose', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	}).bind('gelmodalclose', function(ev, ui) {
		ok(true, '.gelmodal("close") fires gelmodalclose event');
		equals(this, el2[0], 'context of event');
		same(ui, {}, 'ui hash in event');
	});
	el2.gelmodal('close');
});

test("events: beforeClose", function() {
	expect(14);
	var el1, el2, el3, widget;

	el1 = $('<div></div>').gelmodal({
		beforeClose: function(ev, ui) {
			ok(true, '.gelmodal("close") fires beforeClose callback');
			equals(this, el1[0], "context of callback");
			equals(ev.type, 'gelmodalbeforeclose', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
			return false;
		}
	});
	widget = el1.gelmodal('widget');
	el1.gelmodal('open');
	el1.gelmodal('close');
	ok(widget.is(":visible"), 'beforeClose CREATE OPTION callback should prevent gelmodal from closing');

	var el2 = $('<div></div>').gelmodal();
	el2.gelmodal('open');
	el2.gelmodal('option', 'beforeClose', function(ev, ui) {
		ok(true, '.gelmodal("close") fires beforeClose callback');
		equals(this, el2[0], "context of callback");
		equals(ev.type, 'gelmodalbeforeclose', 'event type in callback');
		same(ui, {}, 'ui hash in callback');
		return false;
	});
	el2.gelmodal('close');
	widget = el2.gelmodal('widget');
	ok(widget.is(":visible"), 'beforeClose ADDED OPTION callback should prevent gelmodal from closing');

	var el3 = $('<div></div>').gelmodal().bind('gelmodalbeforeclose', function(ev, ui) {
		ok(true, '.gelmodal("close") triggers gelmodalbeforeclose event');
		equals(this, el3[0], "context of event");
		same(ui, {}, 'ui hash in event');
		return false;
	});
	el3.gelmodal('open');
	el3.gelmodal('close');
	widget = el3.gelmodal('widget');
	ok(widget.is(":visible"), 'gelmodalbeforeclose event should prevent gelmodal from closing');

	// clean up previous tests
	el1.gelmodal({beforeClose: function() { return true; }}).gelmodal('destroy');
	el2.gelmodal({beforeClose: function() { return true; }}).gelmodal('destroy');
	el3.gelmodal().unbind('gelmodalbeforeclose');
	el3.gelmodal({beforeClose: function() { return true; }}).gelmodal('destroy');
});

})(jQuery);