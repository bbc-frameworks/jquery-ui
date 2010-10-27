/*
 * gelmodal_core.js
 */

(function($) {

module('gelmodal: events');

test('open', function() {
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

test("close", function() {
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

test("beforeClose", function() {
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

/*
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
});*/

test('beforeopen', function() {
	expect(2);
	var mask = $('.box-1').gelmodal({beforeOpen:function(){return false;}});
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible before opening');
	mask.gelmodal('open');
	equals( 0, $('.box-1').filter(':visible').size(), 'modal contents are not visible when opening is cancelled');
	mask.gelmodal('destroy');
});
/*
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
	
});*/

})(jQuery);
