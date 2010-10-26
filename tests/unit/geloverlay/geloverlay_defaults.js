/*
 * geloverlay_defaults.js
 */

var geloverlay_defaults = {
	autoOpen: false,
	closeText: 'close',
	disabled: false,
	geloverlayClass: '',
	hide: null,
	height: 'auto',
	minHeight: 150,
	minWidth: 150,
	show: null,
	width: 300,
	zIndex: 300,
	position: {
		my: 'center',
		at: 'center',
		of: window,
		collision: 'fit',
		// ensure that the titlebar is never outside the document
		using: function(pos) {
			var topOffset = $(this).css(pos).offset().top;
			if (topOffset < 0) {
				$(this).css('top', pos.top - topOffset);
			}
		}
	}
};

//commonWidgetTests('geloverlay', { defaults: geloverlay_defaults });
