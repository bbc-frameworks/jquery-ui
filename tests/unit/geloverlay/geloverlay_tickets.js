/*
 * geloverlay_tickets.js
 */
(function($) {

module("geloverlay: tickets");

test("#5184: isOpen in geloverlayclose event is true", function() {
	expect( 3 );

	el = $( "<div></div>" ).geloverlay({
		close: function() {
			ok( !el.geloverlay("isOpen"), "geloverlay is not open during close" );
		}
	});
	ok( el.geloverlay("isOpen"), "geloverlay is open after init" );
	el.geloverlay( "close" );
	ok( !el.geloverlay("isOpen"), "geloverlay is not open after close" );
	el.remove();
});

test("#5531: geloverlay width should be at least minWidth on creation", function () {
    el = $('<div></div>').geloverlay({
            width: 200,
            minWidth: 300
        });

    equals(el.geloverlay('option', 'width'), 300, "width is minWidth");
    el.geloverlay('option', 'width', 200);
    equals(el.geloverlay('option', 'width'), 300, "width unchanged when set to < minWidth");
    el.geloverlay('option', 'width', 320);
    equals(el.geloverlay('option', 'width'), 320, "width changed if set to > minWidth");
    el.remove();

    el = $('<div></div>').geloverlay({
            minWidth: 300
        });
    ok(el.geloverlay('option', 'width') >=  300, "width is at least 300");
    el.remove();

});

})(jQuery);
