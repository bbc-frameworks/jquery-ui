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
		console.log('create');
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
		this._overlay.show();
		this._windowResize();
		this._lockFocus(this.element);
	    this._trigger('open', event);
	},
	close: function(event) {
	    if ( false === this._trigger('beforeclose', event) ) return;
		this._unlockFocus(this.element);
		this.element.hide();
		this._overlay.hide();
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
		this._overlay = $('<div></div>')
			.gelscreenmask()
			.appendTo(document.body)
			.css({
				zIndex: this._zIndex - 1,
				position: 'absolute',
				width: this._overlayWidth(),
				height: this._overlayHeight(),
				top: '0px',
				left: '0px',
				backgroundColor: '#000000',
				opacity: 0.5
			})
			.hide();
		if ($.fn.bgiframe) {
			this._overlay.bgiframe();
		}
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
		this._overlay.height(0).width(0);
		this._overlay.height(this._overlayHeight());
		this._overlay.width(this._overlayWidth());
		this._position(this.options.position);
	},
	_windowResizeEvent: function(event) {
		event.data.modal._windowResize();
	},
	_overlayHeight: function() {
		var scrollHeight,
			offsetHeight;
		// handle IE 6
		if ($.browser.msie && $.browser.version < 7) {
			scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);

			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).height() + 'px';
		}
	},

	_overlayWidth: function() {
		var scrollWidth,
			offsetWidth;
		// handle IE 6
		if ($.browser.msie && $.browser.version < 7) {
			scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);

			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).width() + 'px';
		}
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
	
	
	
}(jQuery));
