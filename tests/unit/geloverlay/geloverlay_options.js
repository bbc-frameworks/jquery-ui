/*
 * geloverlay_options.js
 */
(function($) {

var el;
function dlg() {
	return el.geloverlay('widget');
}

function isOpen(why) {
	ok(dlg().is(":visible"), why);
}

function isNotOpen(why) {
	ok(!dlg().is(":visible"), why);
}





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

test("closeText", function() {
	expect(3);

	el = $('<div></div>').geloverlay();
		equals(dlg().find('.ui-geloverlay-close span').text(), 'close',
			'default close text');
	el.remove();

	el = $('<div></div>').geloverlay({ closeText: "foo" });
		equals(dlg().find('.ui-geloverlay-close span').text(), 'foo',
			'closeText on init');
	el.remove();

	el = $('<div></div>').geloverlay().geloverlay('option', 'closeText', 'bar');
		equals(dlg().find('.ui-geloverlay-close span').text(), 'bar',
			'closeText via option method');
	el.remove();
});

test("geloverlayClass", function() {
	expect(5);

	el = $('<div></div>').geloverlay();
		equals(dlg().is(".foo"), false, 'geloverlayClass not specified. foo class added');
	el.remove();

	el = $('<div></div>').geloverlay({ geloverlayClass: "foo" });
		equals(dlg().is(".foo"), true, 'geloverlayClass in init. foo class added');
	el.remove();

	el = $('<div></div>').geloverlay({ geloverlayClass: "foo bar" });
		equals(dlg().is(".foo"), true, 'geloverlayClass in init, two classes. foo class added');
		equals(dlg().is(".bar"), true, 'geloverlayClass in init, two classes. bar class added');
	
	el = $('<div></div>').geloverlay();
		el.geloverlay('option', 'geloverlayClass', 'baz');
		equals(dlg().is(".baz"), true, 'geloverlayClass via option method');
	el.remove();
});

test("height", function() {
	expect(3);

	el = $('<div></div>').geloverlay({autoOpen:true});
		equals(dlg().height(), geloverlay_defaults.minHeight, "default height");
	el.remove();

	el = $('<div></div>').geloverlay({ autoOpen:true, height: 237 });
		equals(dlg().height(), 237, "explicit height");
	el.remove();

	el = $('<div></div>').geloverlay({autoOpen:true});
		el.geloverlay('option', 'height', 238);
		equals(dlg().height(), 238, "explicit height set after init");
	el.remove();
});

test("width", function() {
	expect(3);

	el = $('<div></div>').geloverlay({autoOpen:true});
		equals(dlg().width(), geloverlay_defaults.width, "default width");
	el.remove();

	el = $('<div></div>').geloverlay({ autoOpen:true, width: 437 });
		equals(dlg().width(), 437, "explicit width");
		el.geloverlay('option', 'width', 438);
		equals(dlg().width(), 438, 'explicit width after init');
	el.remove();
});

})(jQuery);
