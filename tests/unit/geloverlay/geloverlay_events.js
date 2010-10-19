/*
 * geloverlay_events.js
 */
(function($) {

module("geloverlay: events");

test("open", function() {
	expect(8);

	el = $("<div></div>");
	el.geloverlay({
		open: function(ev, ui) {
			ok(el.data("geloverlay")._isOpen, "interal _isOpen flag is set");
			ok(true, 'autoOpen: true fires open callback');
			equals(this, el[0], "context of callback");
			equals(ev.type, 'geloverlayopen', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	});
	el.remove();

	el = $("<div></div>");
	el.geloverlay({
		autoOpen: false,
		open: function(ev, ui) {
			ok(true, '.geloverlay("open") fires open callback');
			equals(this, el[0], "context of callback");
			equals(ev.type, 'geloverlayopen', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	}).bind('geloverlayopen', function(ev, ui) {
		ok(el.data("geloverlay")._isOpen, "interal _isOpen flag is set");
		ok(true, 'geloverlay("open") fires open event');
		equals(this, el[0], 'context of event');
		same(ui, {}, 'ui hash in event');
	});
	el.geloverlay("open");
	el.remove();
});

test("close", function() {
	expect(7);

	el = $('<div></div>').geloverlay({
		close: function(ev, ui) {
			ok(true, '.geloverlay("close") fires close callback');
			equals(this, el[0], "context of callback");
			equals(ev.type, 'geloverlayclose', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
		}
	}).bind('geloverlayclose', function(ev, ui) {
		ok(true, '.geloverlay("close") fires geloverlayclose event');
		equals(this, el[0], 'context of event');
		same(ui, {}, 'ui hash in event');
	});
	el.geloverlay('close');
	el.remove();
});


test("beforeClose", function() {
	expect(14);
	var el, widget;
	
	el = $('<div></div>').geloverlay({
		beforeClose: function(ev, ui) {
			ok(true, '.geloverlay("close") fires beforeClose callback');
			equals(this, el[0], "context of callback");
			equals(ev.type, 'geloverlaybeforeclose', 'event type in callback');
			same(ui, {}, 'ui hash in callback');
			return false;
		},
		autoOpen: true
	});
	widget = el.geloverlay('widget');
	
	el.geloverlay('close');
	ok(widget.is(":visible"), 'beforeClose callback should prevent geloverlay from closing');
	el.remove();

	el = $('<div></div>').geloverlay({autoOpen:true});
	el.geloverlay('option', 'beforeClose', function(ev, ui) {
		ok(true, '.geloverlay("close") fires beforeClose callback');
		equals(this, el[0], "context of callback");
		equals(ev.type, 'geloverlaybeforeclose', 'event type in callback');
		same(ui, {}, 'ui hash in callback');
		return false;
	});
	el.geloverlay('close');
	ok(widget.is(":visible"), 'beforeClose callback should prevent geloverlay from closing');
	el.remove();

	el = $('<div></div>').geloverlay({autoOpen:true}).bind('geloverlaybeforeclose', function(ev, ui) {
		ok(true, '.geloverlay("close") triggers geloverlaybeforeclose event');
		equals(this, el[0], "context of event");
		same(ui, {}, 'ui hash in event');
		return false;
	});
	el.geloverlay('close');
	ok(widget.is(":visible"), 'geloverlaybeforeclose event should prevent geloverlay from closing');
	el.remove();
});

})(jQuery);
