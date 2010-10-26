/*
 * jQuery UI Geloverlay 1.8.5
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Geloverlay
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.gelmodal.js
 */
(function( $, undefined ) {

var uiGeloverlayClasses =
	'ui-geloverlay ' +
	'ui-widget ' +
	'ui-widget-content ' +
	'ui-corner-all ';

$.widget("ui.geloverlay", {
	options: {
		autoOpen: false,
		closeText: 'close',
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
				if (topOffset < 0) $(this).css('top', pos.top - topOffset);
			}
		}
	},

	_create: function() {
		var self = this,
			uiGeloverlay = (self.uiGeloverlay = $('<div></div>'))
				// tabIndex makes the div focusable, outline 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0)
				.attr({role: 'dialog'})
				.addClass(uiGeloverlayClasses + self.options.geloverlayClass),

			content = self.element.addClass('ui-geloverlay-content ui-widget-content'),

			closeLink = $('<a href="#"></a>')
				.addClass('ui-geloverlay-close ui-corner-all')
				.attr('role', 'button')
				.hover( function() { closeLink.addClass   ('ui-state-hover'); },
						function() { closeLink.removeClass('ui-state-hover'); })
				.focus( function() { closeLink.addClass   ('ui-state-focus'); })
				.blur(  function() { closeLink.removeClass('ui-state-focus'); })
				.click( function(event) {
					self.close(event);
					return false;
				}),

			closeText = (self.closeText = $('<span></span>'))
				.addClass('ui-icon ui-icon-closethick')
				.text(self.options.closeText);

		closeText.appendTo(closeLink);
		closeLink.prependTo(uiGeloverlay);
		content.appendTo(uiGeloverlay);
		uiGeloverlay.appendTo(document.body);

		self._isOpen = false;
		self.uiGeloverlay
			.css('position', 'absolute')
			.gelmodal({zDiff: self.options.zIndex});
		if ( self.options.autoOpen ) self.open();
	},

	_stayInCentre: function(event) {
		var self = this;
		$(window).bind('resize.gelmodal scroll.gelmodal', function() {
			self._position(self.options.position);
		});
	},

	open: function() {
		if (this._isOpen) return undefined;
		var self = this;
		if (self.uiGeloverlay.next().length) {
			self.uiGeloverlay.appendTo('body');
		}
		self.uiGeloverlay.show(self.options.show);
		self.uiGeloverlay.gelmodal('open');
		self._size();
		self._position(self.options.position);
		//self._stayInCentre();
		self._isOpen = true;
		self._trigger('open');
		return self;
	},

	close: function(event) {
		var self = this;
		if (false === self._trigger('beforeClose', event)) return false;
		self.uiGeloverlay.gelmodal('close');
		self._isOpen = false;
		if (self.options.hide) {
			self.uiGeloverlay.hide(self.options.hide, function() {
				self._trigger('close', event);
			});
		} else {
			self.uiGeloverlay.hide();
			self._trigger('close', event);
		}
		return self;
	},

	destroy: function() {
		var self = this;
		self.uiGeloverlay.gelmodal('destroy');
		self.uiGeloverlay.hide();
		self.element
			.unbind('.geloverlay')
			.removeData('geloverlay')
			.removeClass('ui-geloverlay-content ui-widget-content')
			.hide().appendTo('body');
		self.uiGeloverlay.remove();
		$(window).unbind('resize.gelmodal scroll.gelmodal');
		return this;
	},

	widget: function() {
		return this.uiGeloverlay;
	},

	isOpen: function() {
		return this._isOpen;
	},

	_position: function(position) {
		var self = this;
		position = $.extend(true, self.options.position, position);
		self.uiGeloverlay.css({left: '0', top: '0'}); // fixes an IE bug with calculating left:/top:auto
		self.uiGeloverlay.position(position);
	},

	/*
	 * _setOption is overridden to allow for any "live" changes that
	 * are required.
	 */
	_setOption: function(key, value){
		var resize = false;
		switch (key) {
			case 'closeText' :
				this.closeText.text("" + value);
				break;
			case 'geloverlayClass' :
				this.uiGeloverlay.removeClass(this.options.geloverlayClass);
				this.uiGeloverlay.addClass(value);
				break;
			case 'height' :
			case 'width' :
			case 'minHeight' :
			case 'minWidth' :
			case 'position' :
				this.options[key] = value;
				resize = true;
				break;
		}
		if ( resize ) this._size();
		$.Widget.prototype._setOption.apply(this, arguments);
	},

	_size: function() {
		/* If the user has resized the geloverlay, the .ui-geloverlay and .ui-geloverlay-content
		 * divs will both have width and height set, so we need to reset them
		 */
		var options = this.options,
			nonContentHeight;

		// reset content sizing
		// hide for non content measurement because height: 0 doesn't work in IE quirks mode (see #4350)
		this.element.css({
			width: 'auto',
			minHeight: 0,
			height: 0
		});

		if (options.minWidth > options.width) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiGeloverlay.css({
				height: 'auto',
				width: options.width
			})
			.height();
		this.element
			.css(options.height === 'auto' ? {
					minHeight: Math.max(options.minHeight - nonContentHeight, 0),
					height: $.support.minHeight ? 'auto' :
						Math.max(options.minHeight - nonContentHeight, 0)
				} : {
					minHeight: 0,
					height: Math.max(options.height - nonContentHeight, 0)
			})
			.show();

		if (this.uiGeloverlay.is(':data(resizable)')) {
			this.uiGeloverlay.resizable('option', 'minHeight', this._minHeight());
		}
	}

});

$.extend($.ui.geloverlay, {
	version: "1.8.5"
});

}(jQuery));
