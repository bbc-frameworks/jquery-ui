/*
 * jQuery UI Overlay @VERSION
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Overlay
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function( $, undefined ) {

var uiOverlayClasses =
		'ui-overlay ' +
		'ui-widget ' +
		'ui-widget-content ' +
		'ui-corner-all ',
	sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	};

$.widget("ui.overlay", {
	options: {
		autoOpen: true,
		buttons: {},
		closeOnEscape: true,
		closeText: 'close',
		overlayClass: '',
		draggable: true,
		hide: null,
		height: 'auto',
		maxHeight: false,
		maxWidth: false,
		minHeight: 150,
		minWidth: 150,
		modal: false,
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
		},
		resizable: true,
		show: null,
		stack: true,
		title: '',
		width: 300,
		zIndex: 1000
	},

	_create: function() {
		this.originalTitle = this.element.attr('title');
		// #5742 - .attr() might return a DOMElement
		if ( typeof this.originalTitle !== "string" ) {
			this.originalTitle = "";
		}

		this.options.title = this.options.title || this.originalTitle;
		var self = this,
			options = self.options,

			title = options.title || '&#160;',
			titleId = $.ui.overlay.getTitleId(self.element),

			uiOverlay = (self.uiOverlay = $('<div></div>'))
				.appendTo(document.body)
				.hide()
				.addClass(uiOverlayClasses + options.overlayClass)
				.css({
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(event) {
					if (options.closeOnEscape && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE) {
						
						self.close(event);
						event.preventDefault();
					}
				})
				.attr({
					role: 'overlay',
					'aria-labelledby': titleId
				})
				.mousedown(function(event) {
					self.moveToTop(false, event);
				}),

			uiOverlayContent = self.element
				.show()
				.removeAttr('title')
				.addClass(
					'ui-overlay-content ' +
					'ui-widget-content')
				.appendTo(uiOverlay),

			uiOverlayTitlebar = (self.uiOverlayTitlebar = $('<div></div>'))
				.addClass(
					'ui-overlay-titlebar ' +
					'ui-widget-header ' +
					'ui-corner-all ' +
					'ui-helper-clearfix'
				)
				.prependTo(uiOverlay),

			uiOverlayTitlebarClose = $('<a href="#"></a>')
				.addClass(
					'ui-overlay-titlebar-close ' +
					'ui-corner-all'
				)
				.attr('role', 'button')
				.hover(
					function() {
						uiOverlayTitlebarClose.addClass('ui-state-hover');
					},
					function() {
						uiOverlayTitlebarClose.removeClass('ui-state-hover');
					}
				)
				.focus(function() {
					uiOverlayTitlebarClose.addClass('ui-state-focus');
				})
				.blur(function() {
					uiOverlayTitlebarClose.removeClass('ui-state-focus');
				})
				.click(function(event) {
					self.close(event);
					return false;
				})
				.appendTo(uiOverlayTitlebar),

			uiOverlayTitlebarCloseText = (self.uiOverlayTitlebarCloseText = $('<span></span>'))
				.addClass(
					'ui-icon ' +
					'ui-icon-closethick'
				)
				.text(options.closeText)
				.appendTo(uiOverlayTitlebarClose),

			uiOverlayTitle = $('<span></span>')
				.addClass('ui-overlay-title')
				.attr('id', titleId)
				.html(title)
				.prependTo(uiOverlayTitlebar);

		//handling of deprecated beforeclose (vs beforeClose) option
		//Ticket #4669 http://dev.jqueryui.com/ticket/4669
		//TODO: remove in 1.9pre
		if ($.isFunction(options.beforeclose) && !$.isFunction(options.beforeClose)) {
			options.beforeClose = options.beforeclose;
		}

		uiOverlayTitlebar.find("*").add(uiOverlayTitlebar).disableSelection();

		if (options.draggable && $.fn.draggable) {
			self._makeDraggable();
		}
		if (options.resizable && $.fn.resizable) {
			self._makeResizable();
		}

		self._createButtons(options.buttons);
		self._isOpen = false;

		if ($.fn.bgiframe) {
			uiOverlay.bgiframe();
		}
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	destroy: function() {
		var self = this;
		
		if (self.screenmask) {
			self.screenmask.destroy();
		}
		self.uiOverlay.hide();
		self.element
			.unbind('.overlay')
			.removeData('overlay')
			.removeClass('ui-overlay-content ui-widget-content')
			.hide().appendTo('body');
		self.uiOverlay.remove();

		if (self.originalTitle) {
			self.element.attr('title', self.originalTitle);
		}

		return self;
	},

	widget: function() {
		return this.uiOverlay;
	},

	close: function(event) {
		var self = this,
			maxZ;
		
		if (false === self._trigger('beforeClose', event)) {
			return;
		}

		if (self.screenmask) {
			self.screenmask.destroy();
		}
		self.uiOverlay.unbind('keypress.ui-overlay');

		self._isOpen = false;

		if (self.options.hide) {
			self.uiOverlay.hide(self.options.hide, function() {
				self._trigger('close', event);
			});
		} else {
			self.uiOverlay.hide();
			self._trigger('close', event);
		}

		$.ui.overlay.screenmask.resize();

		// adjust the maxZ to allow other modal overlays to continue to work (see #4309)
		if (self.options.modal) {
			maxZ = 0;
			$('.ui-overlay').each(function() {
				if (this !== self.uiOverlay[0]) {
					maxZ = Math.max(maxZ, $(this).css('z-index'));
				}
			});
			$.ui.overlay.maxZ = maxZ;
		}

		return self;
	},

	isOpen: function() {
		return this._isOpen;
	},

	// the force parameter allows us to move modal overlays to their correct
	// position on open
	moveToTop: function(force, event) {
		var self = this,
			options = self.options,
			saveScroll;

		if ((options.modal && !force) ||
			(!options.stack && !options.modal)) {
			return self._trigger('focus', event);
		}

		if (options.zIndex > $.ui.overlay.maxZ) {
			$.ui.overlay.maxZ = options.zIndex;
		}
		if (self.screenmask) {
			$.ui.overlay.maxZ += 1;
			self.screenmask.$el.css('z-index', $.ui.overlay.screenmask.maxZ = $.ui.overlay.maxZ);
		}

		//Save and then restore scroll since Opera 9.5+ resets when parent z-Index is changed.
		//  http://ui.jquery.com/bugs/ticket/3193
		saveScroll = { scrollTop: self.element.attr('scrollTop'), scrollLeft: self.element.attr('scrollLeft') };
		$.ui.overlay.maxZ += 1;
		self.uiOverlay.css('z-index', $.ui.overlay.maxZ);
		self.element.attr(saveScroll);
		self._trigger('focus', event);

		return self;
	},

	open: function() {
		if (this._isOpen) { return; }

		var self = this,
			options = self.options,
			uiOverlay = self.uiOverlay;

		self.screenmask = options.modal ? new $.ui.overlay.screenmask(self) : null;
		self._size();
		self._position(options.position);
		uiOverlay.show(options.show);
		self.moveToTop(true);

		// prevent tabbing out of modal overlays
		if (options.modal) {
			uiOverlay.bind('keypress.ui-overlay', function(event) {
				if (event.keyCode !== $.ui.keyCode.TAB) {
					return;
				}

				var tabbables = $(':tabbable', this),
					first = tabbables.filter(':first'),
					last  = tabbables.filter(':last');

				if (event.target === last[0] && !event.shiftKey) {
					first.focus(1);
					return false;
				} else if (event.target === first[0] && event.shiftKey) {
					last.focus(1);
					return false;
				}
			});
		}

		// set focus to the first tabbable element in the content area or the first button
		// if there are no tabbable elements, set focus on the overlay itself
		$(self.element.find(':tabbable').get().concat(
			uiOverlay.find('.ui-overlay-buttonpane :tabbable').get().concat(
				uiOverlay.get()))).eq(0).focus();

		self._isOpen = true;
		self._trigger('open');

		return self;
	},

	_createButtons: function(buttons) {
		var self = this,
			hasButtons = false,
			uiOverlayButtonPane = $('<div></div>')
				.addClass(
					'ui-overlay-buttonpane ' +
					'ui-widget-content ' +
					'ui-helper-clearfix'
				),
			uiButtonSet = $( "<div></div>" )
				.addClass( "ui-overlay-buttonset" )
				.appendTo( uiOverlayButtonPane );

		// if we already have a button pane, remove it
		self.uiOverlay.find('.ui-overlay-buttonpane').remove();

		if (typeof buttons === 'object' && buttons !== null) {
			$.each(buttons, function() {
				return !(hasButtons = true);
			});
		}
		if (hasButtons) {
			$.each(buttons, function(name, props) {
				props = $.isFunction( props ) ?
					{ click: props, text: name } :
					props;
				var button = $('<button type="button"></button>')
					.attr( props, true )
					.unbind('click')
					.click(function() {
						props.click.apply(self.element[0], arguments);
					})
					.appendTo(uiButtonSet);
				if ($.fn.button) {
					button.button();
				}
			});
			uiOverlayButtonPane.appendTo(self.uiOverlay);
		}
	},

	_makeDraggable: function() {
		var self = this,
			options = self.options,
			doc = $(document),
			heightBeforeDrag;

		function filteredUi(ui) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		self.uiOverlay.draggable({
			cancel: '.ui-overlay-content, .ui-overlay-titlebar-close',
			handle: '.ui-overlay-titlebar',
			containment: 'document',
			start: function(event, ui) {
				heightBeforeDrag = options.height === "auto" ? "auto" : $(this).height();
				$(this).height($(this).height()).addClass("ui-overlay-dragging");
				self._trigger('dragStart', event, filteredUi(ui));
			},
			drag: function(event, ui) {
				self._trigger('drag', event, filteredUi(ui));
			},
			stop: function(event, ui) {
				options.position = [ui.position.left - doc.scrollLeft(),
					ui.position.top - doc.scrollTop()];
				$(this).removeClass("ui-overlay-dragging").height(heightBeforeDrag);
				self._trigger('dragStop', event, filteredUi(ui));
				$.ui.overlay.screenmask.resize();
			}
		});
	},

	_makeResizable: function(handles) {
		handles = (handles === undefined ? this.options.resizable : handles);
		var self = this,
			options = self.options,
			// .ui-resizable has position: relative defined in the stylesheet
			// but overlays have to use absolute or fixed positioning
			position = self.uiOverlay.css('position'),
			resizeHandles = (typeof handles === 'string' ?
				handles	:
				'n,e,s,w,se,sw,ne,nw'
			);

		function filteredUi(ui) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		self.uiOverlay.resizable({
			cancel: '.ui-overlay-content',
			containment: 'document',
			alsoResize: self.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: self._minHeight(),
			handles: resizeHandles,
			start: function(event, ui) {
				$(this).addClass("ui-overlay-resizing");
				self._trigger('resizeStart', event, filteredUi(ui));
			},
			resize: function(event, ui) {
				self._trigger('resize', event, filteredUi(ui));
			},
			stop: function(event, ui) {
				$(this).removeClass("ui-overlay-resizing");
				options.height = $(this).height();
				options.width = $(this).width();
				self._trigger('resizeStop', event, filteredUi(ui));
				$.ui.overlay.screenmask.resize();
			}
		})
		.css('position', position)
		.find('.ui-resizable-se').addClass('ui-icon ui-icon-grip-diagonal-se');
	},

	_minHeight: function() {
		var options = this.options;

		if (options.height === 'auto') {
			return options.minHeight;
		} else {
			return Math.min(options.minHeight, options.height);
		}
	},

	_position: function(position) {
		var myAt = [],
			offset = [0, 0],
			isVisible;

		if (position) {
			// deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
	//		if (typeof position == 'string' || $.isArray(position)) {
	//			myAt = $.isArray(position) ? position : position.split(' ');

			if (typeof position === 'string' || (typeof position === 'object' && '0' in position)) {
				myAt = position.split ? position.split(' ') : [position[0], position[1]];
				if (myAt.length === 1) {
					myAt[1] = myAt[0];
				}

				$.each(['left', 'top'], function(i, offsetPosition) {
					if (+myAt[i] === myAt[i]) {
						offset[i] = myAt[i];
						myAt[i] = offsetPosition;
					}
				});

				position = {
					my: myAt.join(" "),
					at: myAt.join(" "),
					offset: offset.join(" ")
				};
			} 

			position = $.extend({}, $.ui.overlay.prototype.options.position, position);
		} else {
			position = $.ui.overlay.prototype.options.position;
		}

		// need to show the overlay to get the actual offset in the position plugin
		isVisible = this.uiOverlay.is(':visible');
		if (!isVisible) {
			this.uiOverlay.show();
		}
		this.uiOverlay
			// workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
			.css({ top: 0, left: 0 })
			.position(position);
		if (!isVisible) {
			this.uiOverlay.hide();
		}
	},

	_setOptions: function( options ) {
		var self = this,
			resizableOptions = {},
			resize = false;

		$.each( options, function( key, value ) {
			self._setOption( key, value );
			
			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
		}
		if ( this.uiOverlay.is( ":data(resizable)" ) ) {
			this.uiOverlay.resizable( "option", resizableOptions );
		}
	},

	_setOption: function(key, value){
		var self = this,
			uiOverlay = self.uiOverlay;

		switch (key) {
			//handling of deprecated beforeclose (vs beforeClose) option
			//Ticket #4669 http://dev.jqueryui.com/ticket/4669
			//TODO: remove in 1.9pre
			case "beforeclose":
				key = "beforeClose";
				break;
			case "buttons":
				self._createButtons(value);
				break;
			case "closeText":
				// ensure that we always pass a string
				self.uiOverlayTitlebarCloseText.text("" + value);
				break;
			case "overlayClass":
				uiOverlay
					.removeClass(self.options.overlayClass)
					.addClass(uiOverlayClasses + value);
				break;
			case "disabled":
				if (value) {
					uiOverlay.addClass('ui-overlay-disabled');
				} else {
					uiOverlay.removeClass('ui-overlay-disabled');
				}
				break;
			case "draggable":
				var isDraggable = uiOverlay.is( ":data(draggable)" )
				if ( isDraggable && !value ) {
					uiOverlay.draggable( "destroy" );
				}
				
				if ( !isDraggable && value ) {
					self._makeDraggable();
				}
				break;
			case "position":
				self._position(value);
				break;
			case "resizable":
				// currently resizable, becoming non-resizable
				var isResizable = uiOverlay.is( ":data(resizable)" )
				if (isResizable && !value) {
					uiOverlay.resizable('destroy');
				}

				// currently resizable, changing handles
				if (isResizable && typeof value === 'string') {
					uiOverlay.resizable('option', 'handles', value);
				}

				// currently non-resizable, becoming resizable
				if (!isResizable && value !== false) {
					self._makeResizable(value);
				}
				break;
			case "title":
				// convert whatever was passed in o a string, for html() to not throw up
				$(".ui-overlay-title", self.uiOverlayTitlebar).html("" + (value || '&#160;'));
				break;
		}

		$.Widget.prototype._setOption.apply(self, arguments);
	},

	_size: function() {
		/* If the user has resized the overlay, the .ui-overlay and .ui-overlay-content
		 * divs will both have width and height set, so we need to reset them
		 */
		var options = this.options,
			nonContentHeight,
			minContentHeight;

		// reset content sizing
		this.element.show().css({
			width: 'auto',
			minHeight: 0,
			height: 0
		});

		if (options.minWidth > options.width) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiOverlay.css({
				height: 'auto',
				width: options.width
			})
			.height();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		
		if ( options.height === "auto" ) {
			// only needed for IE6 support
			if ( $.support.minHeight ) {
				this.element.css({
					minHeight: minContentHeight,
					height: "auto"
				});
			} else {
				this.uiOverlay.show();
				var autoHeight = this.element.css( "height", "auto" ).height();
				this.uiOverlay.hide();
				this.element.height( Math.max( autoHeight, minContentHeight ) );
			}
		} else {
			this.element.height( Math.max( options.height - nonContentHeight, 0 ) );
		}

		if (this.uiOverlay.is(':data(resizable)')) {
			this.uiOverlay.resizable('option', 'minHeight', this._minHeight());
		}
	}
});

$.extend($.ui.overlay, {
	version: "@VERSION",

	uuid: 0,
	maxZ: 0,

	getTitleId: function($el) {
		var id = $el.attr('id');
		if (!id) {
			this.uuid += 1;
			id = this.uuid;
		}
		return 'ui-overlay-title-' + id;
	},

	screenmask: function(overlay) {
		this.$el = $.ui.overlay.screenmask.create(overlay);
	}
});

$.extend($.ui.overlay.screenmask, {
	instances: [],
	// reuse old instances due to IE memory leak with alpha transparency (see #5185)
	oldInstances: [],
	maxZ: 0,
	events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function(event) { return event + '.overlay-screenmask'; }).join(' '),
	create: function(overlay) {
		if (this.instances.length === 0) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the screenmask is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				// handle $(el).overlay().overlay('close') (see #4065)
				if ($.ui.overlay.screenmask.instances.length) {
					$(document).bind($.ui.overlay.screenmask.events, function(event) {
						// stop events if the z-index of the target is < the z-index of the screenmask
						// we cannot return true when we don't want to cancel the event (#3523)
						if ($(event.target).zIndex() < $.ui.overlay.screenmask.maxZ) {
							return false;
						}
					});
				}
			}, 1);

			// allow closing by pressing the escape key
			$(document).bind('keydown.overlay-screenmask', function(event) {
				if (overlay.options.closeOnEscape && event.keyCode &&
					event.keyCode === $.ui.keyCode.ESCAPE) {
					
					overlay.close(event);
					event.preventDefault();
				}
			});

			// handle window resize
			$(window).bind('resize.overlay-screenmask', $.ui.overlay.screenmask.resize);
		}

		var $el = (this.oldInstances.pop() || $('<div></div>').addClass('ui-widget-screenmask'))
			.appendTo(document.body)
			.css({
				width: this.width(),
				height: this.height()
			});

		if ($.fn.bgiframe) {
			$el.bgiframe();
		}

		this.instances.push($el);
		return $el;
	},

	destroy: function($el) {
		this.oldInstances.push(this.instances.splice($.inArray($el, this.instances), 1)[0]);

		if (this.instances.length === 0) {
			$([document, window]).unbind('.overlay-screenmask');
		}

		$el.remove();
		
		// adjust the maxZ to allow other modal overlays to continue to work (see #4309)
		var maxZ = 0;
		$.each(this.instances, function() {
			maxZ = Math.max(maxZ, this.css('z-index'));
		});
		this.maxZ = maxZ;
	},

	height: function() {
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

	width: function() {
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

	resize: function() {
		/* If the overlay is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the screenmask. If the user then drags the
		 * overlay back to the left, the document will become narrower,
		 * so we need to shrink the screenmask to the appropriate size.
		 * This is handled by shrinking the screenmask before setting it
		 * to the full document size.
		 */
		var $screenmasks = $([]);
		$.each($.ui.overlay.screenmask.instances, function() {
			$screenmasks = $screenmasks.add(this);
		});

		$screenmasks.css({
			width: 0,
			height: 0
		}).css({
			width: $.ui.overlay.screenmask.width(),
			height: $.ui.overlay.screenmask.height()
		});
	}
});

$.extend($.ui.overlay.screenmask.prototype, {
	destroy: function() {
		$.ui.overlay.screenmask.destroy(this.$el);
	}
});

}(jQuery));
