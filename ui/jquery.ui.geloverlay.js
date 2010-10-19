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
 *  jquery.ui.button.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.gelmodal.js
 *	jquery.ui.resizable.js
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
		zIndex: 1000,
		position: undefined
	},

	_create: function() {

		var self = this,
			options = self.options,
			
			uiGeloverlay = (self.uiGeloverlay = $('<div></div>'))
				.appendTo(document.body)
				.attr({role: 'dialog'})
				.hide()
				.addClass(uiGeloverlayClasses + options.geloverlayClass)
				.css({
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0),

			uiGeloverlayContent = self.element
				.show()
				.addClass(
					'ui-geloverlay-content ' +
					'ui-widget-content')
				.appendTo(uiGeloverlay),

			uiGeloverlayClose = $('<a href="#"></a>')
				.addClass(
					'ui-geloverlay-close ' +
					'ui-corner-all'
				)
				.attr('role', 'button')
				.hover(
					function() {
						uiGeloverlayClose.addClass('ui-state-hover');
					},
					function() {
						uiGeloverlayClose.removeClass('ui-state-hover');
					}
				)
				.focus(function() {
					uiGeloverlayClose.addClass('ui-state-focus');
				})
				.blur(function() {
					uiGeloverlayClose.removeClass('ui-state-focus');
				})
				.click(function(event) {
					self.close(event);
					return false;
				})
				.prependTo(uiGeloverlay),

			uiGeloverlayCloseText = (self.uiGeloverlayCloseText = $('<span></span>'))
				.addClass(
					'ui-icon ' +
					'ui-icon-closethick'
				)
				.text(options.closeText)
				.appendTo(uiGeloverlayClose);

		self._isOpen = false;

		this.uiGeloverlay.gelmodal({autoOpen:false, position:this.options.position});
		if ( this.options.autoOpen ) this.open();
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
		
		return self;
	},

	widget: function() {
		return this.uiGeloverlay;
	},

	close: function(event) {
		var self = this;

		if (false === self._trigger('beforeClose', event)) {
			return false;
		}

		this.uiGeloverlay.gelmodal('close');
		
		self._isOpen = false;

		if (self.options.hide) {
			self.uiGeloverlay.hide(self.options.hide, function() {
				self._trigger('close', event);
			});
		} else {
			self.uiGeloverlay.hide();
			self._trigger('close', event);
		}
		// 
		// // adjust the maxZ to allow other modal geloverlays to continue to work (see #4309)
		// maxZ = 0;
		// $('.ui-geloverlay').each(function() {
		//  if (this !== self.uiGeloverlay[0]) {
		//	  maxZ = Math.max(maxZ, $(this).css('z-index'));
		//  }
		// });
		// $.ui.geloverlay.maxZ = maxZ;

		return self;
	},

	isOpen: function() {
		return this._isOpen;
	},


	open: function() {
		if (this._isOpen) { return undefined; }

		var self = this,
			options = self.options,
			uiGeloverlay = self.uiGeloverlay;

		if (uiGeloverlay.next().length) {
			uiGeloverlay.appendTo('body');
		}
		self._size();
		uiGeloverlay.show(options.show);

		this.uiGeloverlay.gelmodal('open');
		self._isOpen = true;
		self._trigger('open');

		return self;
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
