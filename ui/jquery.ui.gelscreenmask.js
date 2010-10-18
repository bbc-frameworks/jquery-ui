/*
 * BBC jQuery UI Gel Screen Mask
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.gelcore.js
 */

(function( $, undefined ) {

var overlayClasses = 'ui-widget-overlay';

// TODO add callback triggers
$.widget( 'ui.gelscreenmask', {

	options: {
		opacity: 0.7,
		hideUnmaskables: true,
		zDiff: 5,
		hideElement: true
	},

	mask: null,
	zIndex: 0,
	previousZIndex: null,

	_create: function() {
		if (this.options.zDiff < 0) throw new Error('zIndex must be a positive number.');
		// hide the element early
		if (this.options.hideElement) this.element.css('display', 'none');
		// keep a track of zIndexes
		$.ui.gelscreenmask.zIndex += this.options.zDiff;
		this.zIndex = $.ui.gelscreenmask.zIndex;
		// Reuse the same mask each time by storing it statically
		$.ui.gelscreenmask.html = $.ui.gelscreenmask.html || $('<div></div>').addClass(overlayClasses).css('z-index', this.zIndex);
		// IE 6 specific, use an iframe instead of hiding elements
		if ($.fn.bgiframe && $.browser.msie && $.browser.version < 7) {
			this.options.hideUnmaskables = false;
			$.ui.gelscreenmask.html.bgiframe();
		}
	},

	open: function() {
		if (this.options.hideUnmaskables) this._hideUnMaskables();
		this.previousZIndex = this.element.zIndex();
		this.element.css({
			'zIndex': this.zIndex + 1, 
			'display': 'block'
		});
		this._addMask();
	},

	close: function() {
		if (this.options.hideUnmaskables) this._undoUnMaskables();
		this._removeMask();
		this.element.css({
			'zIndex': this.previousZIndex, 
			'display': 'none'
		});
		//this._resizeMask(); //TODO fails in IE currently, figure out why
	},

	destroy: function() {
		this.close();
		this.element.removeData('gelscreenmask');
		if ($.ui.gelscreenmask.maskStack === 0) {
			$(window).unbind('resize.gelscreenmask', function() {
				that._resizeMask();
			});
		}
		return self;
	},

	widget: function() {
		return $.ui.gelscreenmask.html;
	},

	_addMask: function() {
		var maskStack = $.ui.gelscreenmask.maskStack;
		var that = this;
		// only ever add one mask otherwise update the z-index of the first placed one
		if (maskStack.length === 0) {
			$(document.body).append($.ui.gelscreenmask.html);
			$(window).bind('resize.gelscreenmask', function() {
				that._resizeMask();
			});
		} else {
			// update the zIndex of the mask
			$.ui.gelscreenmask.html.css('z-index', this.zIndex);
		}
		maskStack.push(this.zIndex);
		// size the mask
		this._resizeMask();
	},

	_removeMask: function() {
		var maskStack = $.ui.gelscreenmask.maskStack;
		maskStack.pop();
		if (maskStack.length == 0) {
			// if it's the last mask simply hide it
			$.ui.gelscreenmask.html.remove();
		} else {
			$.ui.gelscreenmask.html.css('z-index', maskStack[maskStack.length-1]);
		}
	},

	_resizeMask: function() {
		$.ui.gelscreenmask.html.css({'width': $(document).width(), 'height': $(document).height()})
	},

	_hideUnMaskables: function() {
		$.ui.gelscreenmask.elementStack.push(this.element);
		$.ui.gelscreenmask.hideUnderlayElementsOf(this.element);
	},

	_undoUnMaskables: function() {
		var g = $.ui.gelscreenmask;
		var s = g.elementStack;
		s.pop();
		// if it's the last undo then simply unhide all, 
		// else hide all the 'underlay' elements of the previous element
		(s.length === 0)? g.undoHiddenElements(): g.hideUnderlayElementsOf(s[s.length-1]);
	}

});

$.extend($.ui.gelscreenmask, {
	version: '1.0.0',
	undoBuffer: null,
	elementStack: [],
	maskStack: [],
	zIndex: 0,
	html: null,

	hideUnderlayElementsOf: function(el) {
		$.ui.gelscreenmask.undoHiddenElements();
		var unMaskables = ['object', 'embed'],
			toHide = $.map(unMaskables, function(v) { return v+':visible' }).join(', '),
			toKeep = el.find(unMaskables.join(', '));
		this.undoBuffer =  $(toHide).not(toKeep).css('visibility', 'hidden');
	},

	undoHiddenElements: function() {
		if (this.undoBuffer) this.undoBuffer.css('visibility', 'visible');
	}
});

})(jQuery);