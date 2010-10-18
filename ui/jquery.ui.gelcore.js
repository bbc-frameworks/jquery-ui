/*
 * Enhance jQuery height/width to correctly return the document height and with in IE 6
 */
(function($) {
    $.each(['width', 'height'], function(i, name) {
        var orig = $.fn[name];
        $.fn[name] = function(size) {
            var elem = this[0];
            // nodeType 9 === document element
            if (elem.nodeType === 9 && $.browser.msie && $.browser.version < 7) {
                var d  = document,
                type   = name === "width" ? { s: "scrollWidth",  o: "offsetWidth"  }:
                                            { s: "scrollHeight", o: "offsetHeight" },
                scroll = Math.max(d.documentElement[type.s], d.body[type.s]),
                offset = Math.max(d.documentElement[type.o], d.body[type.o]);
                var result = (scroll < offset) ? $(window)[name]() : scroll;
                return result;
            } else {
                return orig.call(this, size);
            }
        }
    });
})(jQuery);
