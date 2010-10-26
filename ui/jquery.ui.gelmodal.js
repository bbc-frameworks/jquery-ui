/*
 * BBC jQuery UI Gel Modal
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.gelcore.js
 */

(function( $, undefined ) {

var overlayClasses = 'ui-widget-gelmodal';

$.widget( 'ui.gelmodal', {

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
			this.element.removeData('gelmodal');
			throw new Error('zIndex must be a positive number.');
		}
		// hide the element early
		this.previousDisplay = this.element.css('display');
		if (this.options.hideElement) this.element.css('display', 'none');

		// keep a track of zIndexes
		$.ui.gelmodal.zIndex += this.options.zDiff;
		this.zIndex = $.ui.gelmodal.zIndex;

		// Reuse the same mask each time by storing it statically
		$.ui.gelmodal.html = $.ui.gelmodal.html || $('<div></div>').addClass(overlayClasses);
		// IE 6 specific, use an iframe instead of hiding elements
		if ($.fn.bgiframe && $.browser.msie && $.browser.version < 7) {
			this.options.hideUnmaskables = false;
			$.ui.gelmodal.html.bgiframe();
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
		$.ui.gelmodal._lockFocus(this.element);
	},

	close: function() {
		if (this.options.hideUnmaskables) this._undoUnMaskables();
		this._removeMask();
		this.element.css({
			'zIndex':  this.previousZIndex, 
			'display': this.previousDisplay
		});
		$.ui.gelmodal._unlockFocus(this.element);
		//this._resizeMask(); //TODO fails in IE currently, figure out why
	},

	destroy: function() {
		this.close();
		this.element.removeData('gelmodal');
		if ($.ui.gelmodal.maskStack === 0) {
			$(window).unbind('resize.gelmodal', function() {
				that._resizeMask();
			});
		}
		// decrement the static counter for other masks
		$.ui.gelmodal.zIndex -= this.options.zDiff;
		return self;
	},
	

	widget: function() {
		return $.ui.gelmodal.html;
	},

	_addMask: function() {
		var maskStack = $.ui.gelmodal.maskStack;
		var that = this;
		// only ever add one mask otherwise update the z-index of the first placed one
		if (maskStack.length === 0) {
			$(document.body).append($.ui.gelmodal.html.css('z-index', this.zIndex));
			$(window).bind('resize.gelmodal', function() {
				that._resizeMask();
			});
		} else {
			// update the zIndex of the mask
			$.ui.gelmodal.html.css('z-index', this.zIndex);
		}
		maskStack.push(this.zIndex);
		// size the mask
		this._resizeMask();
	},

	_removeMask: function() {
		var maskStack = $.ui.gelmodal.maskStack;
		maskStack.pop();
		if (maskStack.length == 0) {
			$.ui.gelmodal.html.remove();
		} else {
			// if it's not the last mask, restack the current one
			$.ui.gelmodal.html.css('z-index', maskStack[maskStack.length-1]);
		}
	},

	_resizeMask: function() {
		$.ui.gelmodal.html.css({'width': $(document).width(), 'height': $(document).height()})
	},

	_hideUnMaskables: function() {
		$.ui.gelmodal.elementStack.push(this.element);
		$.ui.gelmodal.hideUnderlayElementsOf(this.element);
	},

	_undoUnMaskables: function() {
		var g = $.ui.gelmodal;
		var s = g.elementStack;
		s.pop();
		// if it's the last undo then simply unhide all, 
		// else hide all the 'underlay' elements of the previous element
		(s.length === 0)? g.undoHiddenElements(): g.hideUnderlayElementsOf(s[s.length-1]);
	}

});

$.extend($.ui.gelmodal, {
	version: '1.0.0',
	undoBuffer: null,
	elementStack: [],
	maskStack: [],
	zIndex: 0,
	html: null,
	lockStack: [],

	hideUnderlayElementsOf: function(el) {
		$.ui.gelmodal.undoHiddenElements();
		var unMaskables = ['object', 'embed'],
			toHide = $.map(unMaskables, function(v) { return v+':visible' }).join(', '),
			toKeep = el.find(unMaskables.join(', '));
		this.undoBuffer =  $(toHide).not(toKeep).css('visibility', 'hidden');
	},

	undoHiddenElements: function() {
		if (this.undoBuffer) this.undoBuffer.css('visibility', 'visible');
	},

	/**
	 * lock focus to a specific dom element
	 * 
	 * @TODO "remember" previously focused item when traversing multi-modal stacks
	 */
	_lockFocus: function($el, ignoreStack) {
		var stackLength = this.lockStack.length,
			tabbables = this._sortedTabbables($el);
		if ( !ignoreStack && stackLength > 0 ) this._unlockFocus(this.lockStack[stackLength-1], true);
		if ( tabbables[0] ) {
			try { tabbables[0].focus(); } catch(e) {}
		}
		this._trackFocusedElement( $el, this);
		this._trackShiftKey( tabbables, this);
		this._captureTabOutOfEdgeElements( $el );
		$(document).bind('focusin', {el: $el, modal:this, tabbables:tabbables}, this._lockFocusEvent);
		if ( !ignoreStack ) this.lockStack.push($el);
		return $el;
	},

	/**
	 * event for _lockFocus, separated for safe unbinding
	 */
	_lockFocusEvent: function(event) {
		var focused = event.originalTarget || event.srcElement,
			tabbables = event.data.tabbables,
			modal = event.data.modal,
			previous = modal._focusedElement,
			backwards = modal._shiftKey,
			$el = event.data.el;
		if ( focused !== $(document)[0] && tabbables.index(focused) === -1 ) {
			try {
				modal._nextItemByTabIndex(tabbables, previous, backwards).focus();
			} catch(e) {}
		}
	},

	/**
	 * unlock focus from a specific dom element
	 */
	_unlockFocus: function($el, ignoreStack) {
		var tabbables = this._sortedTabbables($el);
		this._untrackFocusedElement($el);
		this._untrackShiftKey(tabbables);
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
	_trackShiftKey: function($tabbables, store) {
		return $tabbables.bind('keydown', {store:store}, this._trackShiftKeyEvent);
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
	_untrackShiftKey: function($tabbables) {
		return $tabbables.unbind('keydown', this._trackShiftKeyEvent);
	},

	/**
	 * Capture tabbing from the "edge" elements (in dom order)
	 * so that we can avoid jumping out to the browser's chrome
	 * @fixme - "keydown" does not capture repeats when holding the key down
	 */
	_captureTabOutOfEdgeElements: function($el) {
		var tabbables = $(':tabbable', $el),
			last = tabbables.last(),
			first = tabbables.filter('input,select,textarea').first();
		last.bind('keydown', {modal:this, el:$el, tabbables:tabbables, forwards:true}, this._captureTabOutOfEdgeElementsEvent);
		first.bind('keydown', {modal:this, el:$el, tabbables:tabbables, forwards:false}, this._captureTabOutOfEdgeElementsEvent);
	},

	/**
	 * Event to capture tabbing from the "edge" elements
	 */
	_captureTabOutOfEdgeElementsEvent: function(event) {
		var forwards = event.data.forwards;
		if ( event.keyCode !== $.ui.keyCode.TAB || (event.shiftKey==forwards) ) return true;
		var tabbables = event.data.tabbables,
			modal = event.data.modal,
			$el = event.data.el,
			sortedTabbables = modal._sortedTabbables($el);
		modal._nextItemByTabIndex(sortedTabbables, this, !forwards).focus();
		return false;
	},

	/**
	 * Stop capturing tabbing from the "edge" elements
	 */
	_unCaptureTabOutOfEdgeElements: function($el) {
		var tabbables = $(':tabbable', $el),
			last = tabbables.last(),
			first = tabbables.filter('input,select,textarea').first();
		last.unbind('keydown', this._captureTabOutOfLastElementEvent);
		first.unbind('keydown', this._captureTabOutOfLastElementEvent);
	},

	/**
	 * utility method to sort an elements tabbable children by tabIndex.
	 * note that since ECMAScript does not guarantee stability in .sort()
	 * comparison functions, we actually enforce this to mimic tabindex
	 * and then source-order style sorting.
	 * 
	 * @TODO sort out -1 z-indexes
	 */
	_sortedTabbables: function($el) {
		var tabbables = $(':tabbable', $el),
			originals = tabbables.get();
		tabbables = tabbables.sort(function(a,b){
			var a1 = parseInt(a.tabIndex||0,10),
				b1 = parseInt(b.tabIndex||0,10);
				if ( a1 == -1 ) a1 = 0;
				if ( b1 == -1 ) b1 = 0;
			if ( a1 == b1 ) {
				var a2 = $.inArray(a, originals);
				var b2 = $.inArray(b, originals);
				return a2 - b2;
			}
			return a1 - b1;
		});
		/* HACK FOR IE NON-VISIBLE WEIRDNESS */
		if ( tabbables[0].nodeName.toLowerCase() !== 'a' ) {
			tabbables = $('a', $el).first().add(tabbables);
		}
		return tabbables;
	}

});

})(jQuery);