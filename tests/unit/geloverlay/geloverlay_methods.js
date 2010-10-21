/*
 * geloverlay_methods.js
 */
(function($) {

var el;
function dlg() {
	return el.geloverlay('widget');
}

module("geloverlay: methods", {
	teardown: function() {
		$("body>.ui-geloverlay").remove();
		$("body>.ui-gelscreenmask").remove();
	}
});

test("init", function() {
	expect(6);

	$('<div class="test"></div>').appendTo('body').geloverlay({autoOpen:true}).remove();
	ok(true, '.geloverlay() called on element');

	$([]).geloverlay({autoOpen:true}).remove();
	ok(true, '.geloverlay() called on empty collection');

	$('<div class="test"></div>').geloverlay({autoOpen:true}).remove();
	ok(true, '.geloverlay() called on disconnected DOMElement - never connected');

	$('<div class="test"></div>').appendTo('body').remove().geloverlay({autoOpen:true}).remove();
	ok(true, '.geloverlay() called on disconnected DOMElement - removed');

	el = $('<div class="test"></div>').geloverlay({autoOpen:true});
	var foo = el.geloverlay("option", "foo");
	el.remove();
	ok(true, 'arbitrary option getter after init');

	$('<div class="test"></div>').geloverlay({autoOpen:true}).geloverlay("option", "foo", "bar").remove();
	ok(true, 'arbitrary option setter after init');
});

test("destroy", function() {
	$('<div class="test"></div>').appendTo('body').geloverlay({autoOpen:true}).geloverlay("destroy").remove();
	ok(true, '.geloverlay("destroy") called on element');

	$([]).geloverlay({autoOpen:true}).geloverlay("destroy").remove();
	ok(true, '.geloverlay("destroy") called on empty collection');

	$('<div class="test"></div>').geloverlay({autoOpen:true}).geloverlay("destroy").remove();
	ok(true, '.geloverlay("destroy") called on disconnected DOMElement');

	var expected = $('<div class="test"></div>').geloverlay({autoOpen:true}),
		actual = expected.geloverlay('destroy');
	equals(actual, expected, 'destroy is chainable');
});

test("enable", function() {
	var expected = $('<div class="test"></div>').geloverlay({autoOpen:true}),
		actual = expected.geloverlay('enable');
	equals(actual, expected, 'enable is chainable');
	
	el = $('<div class="test"></div>').geloverlay({ autoOpen: true, disabled: true });
	el.geloverlay('enable');
	equals(el.geloverlay('option', 'disabled'), false, 'enable method sets disabled option to false');
	ok(!dlg().hasClass('ui-geloverlay-disabled'), 'enable method removes ui-geloverlay-disabled class from ui-geloverlay element');
});

test("disable", function() {
	var expected = $('<div class="test"></div>').geloverlay({autoOpen:true}),
		actual = expected.geloverlay('disable');
	equals(actual, expected, 'disable is chainable');
	
	el = $('<div class="test"></div>').geloverlay({ autoOpen: true, disabled: false });
	el.geloverlay('disable');
	equals(el.geloverlay('option', 'disabled'), true, 'disable method sets disabled option to true');
	ok(dlg().hasClass('ui-geloverlay-disabled'), 'disable method adds ui-geloverlay-disabled class to ui-geloverlay element');
});

test("close", function() {
	var expected = $('<div class="test"></div>').geloverlay({autoOpen:true}),
		actual = expected.geloverlay('close');
	equals(actual, expected, 'close is chainable');
	
	el = $('<div class="test"></div>').geloverlay({autoOpen:true});
	ok(dlg().is(':visible') && !dlg().is(':hidden'), 'geloverlay visible before close method called');
	el.geloverlay('close');
	ok(dlg().is(':hidden') && !dlg().is(':visible'), 'geloverlay hidden after close method called');
});

test("isOpen", function() {
	expect(4);

	el = $('<div class="test"></div>').geloverlay({autoOpen:true});
	equals(el.geloverlay('isOpen'), true, "geloverlay is open after init");
	el.geloverlay('close');
	equals(el.geloverlay('isOpen'), false, "geloverlay is closed");
	el.remove();

	el = $('<div class="test"></div>').geloverlay();
	equals(el.geloverlay('isOpen'), false, "geloverlay is closed after init");
	el.geloverlay('open');
	equals(el.geloverlay('isOpen'), true, "geloverlay is open");
	el.remove();
});

test("open", function() {
	var expected = $('<div class="test"></div>').geloverlay({autoOpen:true}),
		actual = expected.geloverlay('open');
	equals(actual, expected, 'open is chainable');

	el = $('<div class="test"></div>').geloverlay();
	ok(dlg().is(':hidden') && !dlg().is(':visible'), 'geloverlay hidden before open method called');
	el.geloverlay('open');
	ok(dlg().is(':visible') && !dlg().is(':hidden'), 'geloverlay visible after open method called');
});

})(jQuery);
