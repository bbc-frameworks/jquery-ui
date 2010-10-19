/*
 * BBC jQuery UI Gel Modal
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.gelscreenmask.js
 */
(function( $, undefined ) {
	
$.widget("ui.gelmodal", {
	options: {
		autoOpen: false,
		closeOnEscape: true,
		overlay: true,
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
	},
	
	_zIndex: 999999,
	
	_create: function() {
		if ( this.options.overlay ) this._makeOverlay();
		this.element
			.css({
				zIndex: this._zIndex,
				position: 'absolute'	
			})
			.addClass('ui-widget')
			.hide();
		if ( this.options.autoOpen ) this.open();
	},
	open: function(event) {
	    if ( false === this._trigger('beforeopen', event) ) return;
		this.element.show();
		this._overlay.gelscreenmask('open');
		this._windowResize();
		this._lockFocus(this.element);
	    this._trigger('open', event);
	},
	close: function(event) {
	    if ( false === this._trigger('beforeclose', event) ) return;
		this._unlockFocus(this.element);
		this.element.hide();
		this._overlay.gelscreenmask('close');
	    this._trigger('close', event);
	},
	widget: function() {
		return this._overlay;
	},
	destroy: function() {
		this._overlay.remove();
		$.ui.widget.prototype.destroy.call(this);
	},
	
	/**
	 * This method should be called whenever the dom inside the overlay is updated.
	 * Delegation is possibly a better solution, but ultimately we would still need
	 * to refresh the list of "focusables" anyway, since we need to be able to jump
	 * back in to the list (and something might have been deleted or disabled) and
	 * delegation does not solve that.
	 */
	refreshFocusLock: function() {
		this._unlockFocus(this.element);
		this._lockFocus(this.element);
	},
	
	_overlay: null,
	/**
	 * Make the overlay div.  This is extracted out of the _create method so that it
	 * is more straightforward to refactor and override
	 */
	_makeOverlay: function() {
		this._overlay = this.element.gelscreenmask();
		return this._overlay;
	},
	_destroyOverlay: function() {
		this._overlay.remove();
	},
	
	
	/**
	 * lock focus to a specific dom element
	 */
	_lockFocus: function($el) {
		var focusables = this._sortedFocusables($el);
		focusables[0].focus();
		this._trackFocusedElement( $el, this);
		this._trackShiftKey( focusables, this);
		this._captureTabOutOfEdgeElements( $el );
		$(document).bind('focusin', {el: $el, modal:this, focusables:focusables}, this._lockFocusEvent);
		if ( this.options.closeOnEscape ) {
			$(document).bind('keypress', {modal:this}, this._closeOnEscapeEvent);
		}
		if (this.options.position.at === 'center') {
			// need to research the scroll event before attaching bind('resize, scroll')
			($.browser.msie && $.browser.version == 6) ? null : 
				$(window).bind('resize', {modal:this}, this._windowResizeEvent);
		}
		return $el;
	},
	/**
	 * event for _lockFocus, separated for safe unbinding
	 */
	_lockFocusEvent: function(event) {
		var focused = event.originalTarget || event.srcElement,
			focusables = event.data.focusables,
			modal = event.data.modal,
			previous = modal._focusedElement,
			backwards = modal._shiftKey,
			$el = event.data.el;
		if ( focused !== $(document)[0] && focusables.index(focused) === -1 ) {
			modal._nextItemByTabIndex(focusables, previous, backwards).focus();
		}
	},
	/**
	 * closes modal on escape keypress
	 */
	_closeOnEscapeEvent: function(event) {
		if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
			// call the close method
			event.data.modal.close();
			// stop bubbling
			return false;
		}
	},
	/**
	 * unlock focus from a specific dom element
	 */
	_unlockFocus: function($el) {
		var focusables = this._sortedFocusables($el);
		this._untrackFocusedElement($el);
		this._untrackShiftKey(focusables);
		this._unCaptureTabOutOfEdgeElements( $el );
		$(document).unbind('focusin', this._lockFocusEvent);
		$el.unbind('keypress', this._closeOnEscapeEvent);
		$(document).unbind('resize', this._windowResizeEvent);
		return $el;
	},
	
	/**
	 * given a tabindex-sorted list of dom elements,
	 * the previously focused element, and the direction go to the
	 * next element.  Loops forward or backward as required.
	 */
	_nextItemByTabIndex: function($list, previous, backwards) {
		var index = $list.index(previous),
			oldIndex = index;
		if ( !backwards ) {
			index = ( index>-1 && index<$list.size()-1 ) ? index+1 : 0;
		} else {
			index = ( index>0 ) ? index-1 : $list.size()-1;
		}
		return $list[index];
	},
	
	/**
	 * state value for the last focused element
	 */
	_focusedElement: null,
	/**
	 * track focused element
	 */
	_trackFocusedElement: function($list, store) {
		return $list.bind('focusin', {store:store}, this._trackFocusedElementEvent);
	},
	/**
	 * event to track focused element
	 */
	_trackFocusedElementEvent: function(event) {
		event.data.store._focusedElement = event.originalTarget || event.srcElement;
	},
	/**
	 * stop tracking focused element
	 */
	_untrackFocusedElement: function($list) {
		return $list.unbind('focusin', this._trackFocusedElementEvent);
	},
	
	/**
	 * state value for shift key on tabbing
	 */
	_shiftKey: false,
	/**
	 * track the use of the shift key when tabbing
	 */
	_trackShiftKey: function($focusables, store) {
		return $focusables.bind('keydown', {store:store}, this._trackShiftKeyEvent);
	},
	/**
	 * event for tracking the use of the shift key, separated for safe unbinding
	 */
	_trackShiftKeyEvent: function(event) {
		if ( event.keyCode !== $.ui.keyCode.TAB ) return;
		event.data.store._shiftKey = event.shiftKey;
	},
	/**
	 * stop tracking the use of the shift key when tabbing
	 */
	_untrackShiftKey: function($focusables) {
		return $focusables.unbind('keydown', this._trackShiftKeyEvent);
	},
	
	
	/**
	 * Capture tabbing from the "edge" elements (in dom order)
	 * so that we can avoid jumping out to the browser's chrome
	 * @fixme - "keydown" does not capture repeats when holding the key down
	 */
	_captureTabOutOfEdgeElements: function($el) {
		var focusables = $(':tabbable', $el),
			last = focusables.last(),
			first = focusables.filter('input,select,textarea').first();
		last.bind('keydown', {modal:this, el:$el, focusables:focusables, forwards:true}, this._captureTabOutOfEdgeElementsEvent);
		first.bind('keydown', {modal:this, el:$el, focusables:focusables, forwards:false}, this._captureTabOutOfEdgeElementsEvent);
	},
	/**
	 * Event to capture tabbing from the "edge" elements
	 */
	_captureTabOutOfEdgeElementsEvent: function(event) {
		var forwards = event.data.forwards;
		if ( event.keyCode !== $.ui.keyCode.TAB || (event.shiftKey==forwards) ) return true;
		var focusables = event.data.focusables,
			modal = event.data.modal,
			$el = event.data.el,
			sortedFocusables = modal._sortedFocusables($el);
		modal._nextItemByTabIndex(sortedFocusables, this, !forwards).focus();
		return false;
	},
	/**
	 * Stop capturing tabbing from the "edge" elements
	 */
	_unCaptureTabOutOfEdgeElements: function($el) {
		var focusables = $(':tabbable', $el),
			last = focusables.last(),
			first = focusables.filter('input,select,textarea').first();
		last.unbind('keydown', this._captureTabOutOfLastElementEvent);
		first.unbind('keydown', this._captureTabOutOfLastElementEvent);
	},
	
	/**
	 * utility method to sort an elements focusable children by tabIndex.
	 * note that since ECMAScript does not guarantee stability in .sort()
	 * comparison functions, we actually enforce this to mimic tabindex
	 * and then source-order style sorting.
	 */
	_sortedFocusables: function($el) {
		var focusables = $(':focusable', $el),
			originals = focusables.toArray();
		return $(':focusable', $el).sort(function(a,b){
			var a1 = parseInt(a.tabIndex||0,10),
				b1 = parseInt(b.tabIndex||0,10);
			if ( a1 == b1 ) {
				var a2 = $.inArray(a, originals);
				var b2 = $.inArray(b, originals);
				return a2 - b2;
			}
			return a1 - b1;
		});
	},
	
	
	
	_windowResize: function() {
		this._position(this.options.position);
	},
	_windowResizeEvent: function(event) {
		event.data.modal._windowResize();
	},
	
	_position: function(position) {
		position = $.extend(true, this.options.position, position);
		// fixes an IE bug with calculating left:/top:auto
		this.element.css({
			left: '0',
			top: '0'
		});
		this.element.position(position);
	}
});






var overlayClasses = 'ui-widget-gelscreenmask';

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
		// IE 6 specific, use an iframe instead of hiding elements
		if ($.fn.bgiframe && $.browser.msie && $.browser.version < 7) {
			this.options.hideUnmaskables = false;
			this.widget().bgiframe();
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
		// Reuse the same mask each time by storing it statically
		if ( !$.ui.gelscreenmask.html ) $.ui.gelscreenmask.html = $('<div></div>').addClass(overlayClasses).css('z-index', this.zIndex);
		return $.ui.gelscreenmask.html;
	},

	_addMask: function() {
		var maskStack = $.ui.gelscreenmask.maskStack;
		var that = this;
		// only ever add one mask otherwise update the z-index of the first placed one
		if (maskStack.length === 0) {
			$(document.body).append(this.widget());
			$(window).bind('resize.gelscreenmask', function() {
				that._resizeMask();
			});
		} else {
			// update the zIndex of the mask
			this.widget().css('z-index', this.zIndex);
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
			this.widget().remove();
		} else {
			this.widget().css('z-index', maskStack[maskStack.length-1]);
		}
	},

	_resizeMask: function() {
		this.widget().css({'width': $(document).width(), 'height': $(document).height()});
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
			toHide = $.map(unMaskables, function(v) { return v+':visible'; }).join(', '),
			toKeep = el.find(unMaskables.join(', '));
		this.undoBuffer =  $(toHide).not(toKeep).css('visibility', 'hidden');
	},

	undoHiddenElements: function() {
		if (this.undoBuffer) this.undoBuffer.css('visibility', 'visible');
	}
});




}(jQuery));
