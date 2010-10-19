/*
 * geloverlay_options.js
 */
(function($) {

module("geloverlay: options");

test("autoOpen", function() {
	expect(2);

	el = $('<div></div>').geloverlay({ autoOpen: false });
		isNotOpen('.geloverlay({ autoOpen: false })');
	el.remove();

	el = $('<div></div>').geloverlay({ autoOpen: true });
		isOpen('.geloverlay({ autoOpen: true })');
	el.remove();
});

test("closeOnEscape", function() {
	el = $('<div></div>').geloverlay();
	ok(dlg().is(':visible') && !dlg().is(':hidden'), 'geloverlay is open before ESC');
	el.simulate('keydown', { keyCode: $.ui.keyCode.ESCAPE })
		.simulate('keypress', { keyCode: $.ui.keyCode.ESCAPE })
		.simulate('keyup', { keyCode: $.ui.keyCode.ESCAPE });
	ok(dlg().is(':hidden') && !dlg().is(':visible'), 'geloverlay is closed after ESC');
});

test("closeText", function() {
	expect(3);

	el = $('<div></div>').geloverlay();
		equals(dlg().find('.ui-geloverlay-titlebar-close span').text(), 'close',
			'default close text');
	el.remove();

	el = $('<div></div>').geloverlay({ closeText: "foo" });
		equals(dlg().find('.ui-geloverlay-titlebar-close span').text(), 'foo',
			'closeText on init');
	el.remove();

	el = $('<div></div>').geloverlay().geloverlay('option', 'closeText', 'bar');
		equals(dlg().find('.ui-geloverlay-titlebar-close span').text(), 'bar',
			'closeText via option method');
	el.remove();
});

test("geloverlayClass", function() {
	expect(4);

	el = $('<div></div>').geloverlay();
		equals(dlg().is(".foo"), false, 'geloverlayClass not specified. foo class added');
	el.remove();

	el = $('<div></div>').geloverlay({ geloverlayClass: "foo" });
		equals(dlg().is(".foo"), true, 'geloverlayClass in init. foo class added');
	el.remove();

	el = $('<div></div>').geloverlay({ geloverlayClass: "foo bar" });
		equals(dlg().is(".foo"), true, 'geloverlayClass in init, two classes. foo class added');
		equals(dlg().is(".bar"), true, 'geloverlayClass in init, two classes. bar class added');
	el.remove();
});

test("height", function() {
	expect(3);

	el = $('<div></div>').geloverlay();
		equals(dlg().height(), geloverlay_defaults.minHeight, "default height");
	el.remove();

	el = $('<div></div>').geloverlay({ height: 237 });
		equals(dlg().height(), 237, "explicit height");
	el.remove();

	el = $('<div></div>').geloverlay();
		el.geloverlay('option', 'height', 238);
		equals(dlg().height(), 238, "explicit height set after init");
	el.remove();
});

test("position, default center on window", function() {
	var el = $('<div></div>').geloverlay();
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, Math.floor($(window).width() / 2 - geloverlay.outerWidth() / 2) + $(window).scrollLeft());
	same(offset.top, Math.floor($(window).height() / 2 - geloverlay.outerHeight() / 2) + $(window).scrollTop());
	el.remove();
});

test("position, top on window", function() {
	var el = $('<div></div>').geloverlay({ position: "top" });
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, Math.floor($(window).width() / 2 - geloverlay.outerWidth() / 2) + $(window).scrollLeft());
	same(offset.top, $(window).scrollTop());
	el.remove();
});

test("position, left on window", function() {
	var el = $('<div></div>').geloverlay({ position: "left" });
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, 0);
	same(offset.top, Math.floor($(window).height() / 2 - geloverlay.outerHeight() / 2) + $(window).scrollTop());
	el.remove();
});

test("position, right bottom on window", function() {
	var el = $('<div></div>').geloverlay({ position: "right bottom" });
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, $(window).width() - geloverlay.outerWidth() + $(window).scrollLeft());
	same(offset.top, $(window).height() - geloverlay.outerHeight() + $(window).scrollTop());
	el.remove();
});

test("position, right bottom on window w/array", function() {
	var el = $('<div></div>').geloverlay({ position: ["right", "bottom"] });
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, $(window).width() - geloverlay.outerWidth() + $(window).scrollLeft());
	same(offset.top, $(window).height() - geloverlay.outerHeight() + $(window).scrollTop());
	el.remove();
});

test("position, offset from top left w/array", function() {
	var el = $('<div></div>').geloverlay({ position: [10, 10] });
	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();
	same(offset.left, 10 + $(window).scrollLeft());
	same(offset.top, 10 + $(window).scrollTop());
	el.remove();
});

test("position, right bottom at right bottom via ui.position args", function() {
	var el = $('<div></div>').geloverlay({
		position: {
			my: "right bottom",
			at: "right bottom"
		}
	});

	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();

	same(offset.left, $(window).width() - geloverlay.outerWidth() + $(window).scrollLeft());
	same(offset.top, $(window).height() - geloverlay.outerHeight() + $(window).scrollTop());
	el.remove();
});

test("position, at another element", function() {
	var parent = $('<div></div>').css({
		position: 'absolute',
		top: 400,
		left: 600,
		height: 10,
		width: 10
	}).appendTo('body');

	var el = $('<div></div>').geloverlay({
		position: {
			my: "left top",
			at: "left top",
			of: parent
		}
	});

	var geloverlay = el.geloverlay('widget');
	var offset = geloverlay.offset();

	same(offset.left, 600);
	same(offset.top, 400);

	el.geloverlay('option', 'position', {
			my: "left top",
			at: "right bottom",
			of: parent
	});

	var offset = geloverlay.offset();

	same(offset.left, 610);
	same(offset.top, 410);

	el.remove();
	parent.remove();
});

test("title", function() {
	expect(9);

	function titleText() {
		return dlg().find(".ui-geloverlay-title").html();
	}

	el = $('<div></div>').geloverlay();
		// some browsers return a non-breaking space and some return "&nbsp;"
		// so we get the text to normalize to the actual non-breaking space
		equals(dlg().find(".ui-geloverlay-title").text(), " ", "[default]");
		equals(el.geloverlay("option", "title"), "", "option not changed");
	el.remove();

	el = $('<div title="foo"/>').geloverlay();
		equals(titleText(), "foo", "title in element attribute");
		equals(el.geloverlay("option", "title"), "foo", "option updated from attribute");
	el.remove();

	el = $('<div></div>').geloverlay({ title: 'foo' });
		equals(titleText(), "foo", "title in init options");
		equals(el.geloverlay("option", "title"), "foo", "opiton set from options hash");
	el.remove();

	el = $('<div title="foo"/>').geloverlay({ title: 'bar' });
		equals(titleText(), "bar", "title in init options should override title in element attribute");
		equals(el.geloverlay("option", "title"), "bar", "opiton set from options hash");
	el.remove();

	el = $('<div></div>').geloverlay().geloverlay('option', 'title', 'foo');
		equals(titleText(), 'foo', 'title after init');
	el.remove();
});

test("width", function() {
	expect(3);

	el = $('<div></div>').geloverlay();
		equals(dlg().width(), geloverlay_defaults.width, "default width");
	el.remove();

	el = $('<div></div>').geloverlay({width: 437 });
		equals(dlg().width(), 437, "explicit width");
		el.geloverlay('option', 'width', 438);
		equals(dlg().width(), 438, 'explicit width after init');
	el.remove();
});

})(jQuery);
