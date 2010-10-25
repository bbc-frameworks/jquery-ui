/*
 * BBC jQuery UI Gel Screen Mask
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.gelcore.js
 */

(function( $, undefined ) {

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
	previousDisplay: null,

	_create: function() {
		if (this.options.zDiff < 0) {
			this.element.removeData('gelscreenmask');
			throw new Error('zIndex must be a positive number.');
		}
		// hide the element early
		this.previousDisplay = this.element.css('display');
		if (this.options.hideElement) this.element.css('display', 'none');
		
		// keep a track of zIndexes
		$.ui.gelscreenmask.zIndex += this.options.zDiff;
		this.zIndex = $.ui.gelscreenmask.zIndex;
		
		// Reuse the same mask each time by storing it statically
		$.ui.gelscreenmask.html = $.ui.gelscreenmask.html || $('<div></div>').addClass(overlayClasses);
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
		$.ui.gelscreenmask._lockFocus(this.element);
		this._addMask();
	},

	close: function() {
		if (this.options.hideUnmaskables) this._undoUnMaskables();
		this._removeMask();
		this.element.css({
			'zIndex':  this.previousZIndex, 
			'display': this.previousDisplay
		});
		$.ui.gelscreenmask._unlockFocus(this.element);
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
		// decrement the static counter for other masks
		$.ui.gelscreenmask.zIndex -= this.options.zDiff;
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
			$(document.body).append($.ui.gelscreenmask.html.css('z-index', this.zIndex));
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
	lockStack: [],

	
	
	/**
	 * lock focus to a specific dom element
	 */
	_lockFocus: function($el, ignoreStack) {
		var stackLength = this.lockStack.length,
			focusables = this._sortedFocusables($el);
		if ( !ignoreStack && stackLength > 0 ) this._unlockFocus(this.lockStack[stackLength-1], true);
		if ( focusables[0] ) focusables[0].focus();
		this._trackFocusedElement( $el, this);
		this._trackShiftKey( focusables, this);
		this._captureTabOutOfEdgeElements( $el );
		$(document).bind('focusin', {el: $el, modal:this, focusables:focusables}, this._lockFocusEvent);
		if ( !ignoreStack ) this.lockStack.push($el);
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
	 * unlock focus from a specific dom element
	 */
	_unlockFocus: function($el, ignoreStack) {
		var focusables = this._sortedFocusables($el);
		this._untrackFocusedElement($el);
		this._untrackShiftKey(focusables);
		this._unCaptureTabOutOfEdgeElements( $el );
		$(document).unbind('focusin', this._lockFocusEvent);
		$el.unbind('keypress', this._closeOnEscapeEvent);
		$(document).unbind('resize', this._windowResizeEvent);
		if ( !ignoreStack ) {
			this.lockStack.pop();
			var stackLength = this.lockStack.length;
			if ( stackLength > 0 ) {
				this._lockFocus(this.lockStack[stackLength-1], true);
			}
		}
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
		return focusables.sort(function(a,b){
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