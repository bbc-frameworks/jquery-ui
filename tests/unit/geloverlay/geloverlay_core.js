/*
 * geloverlay_core.js
 */


(function($) {

module("geloverlay: core");


test("ARIA", function() {
	expect(2);

	var el = $('<div></div>').geloverlay(),
		widget = el.geloverlay('widget');

	equals(widget.attr('role'), 'dialog', 'dialog role');

	equals(widget.find('.ui-geloverlay-close').attr('role'), 'button', 'close link role');
	el.geloverlay('destroy');
});

test("widget method", function() {
	var geloverlay = $("<div/>").appendTo("#main").geloverlay();
	same(geloverlay.parent()[0], geloverlay.geloverlay("widget")[0]);
	geloverlay.geloverlay('destroy');
});

})(jQuery);
