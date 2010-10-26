/*
 * gelcore.js
 */
(function($) {

module("gelcore - jQuery extensions");

/*
 * <div id="dimensions" style="
    float: left; 
    height: 50px; 
    width: 100px; 
    margin: 1px 12px 11px 2px; 
    border-style: solid; 
    border-width: 3px 14px 13px 4px; 
    padding: 5px 16px 15px 6px;"></div>
 */

test("width - getter (created element)", function() {
    var el = $("<div></div>");

    ok(el.width() !=  null, "element.width() doesnt return null");
    equal(typeof el.width(),"number", "element.width() returns a number");
    el.remove();
});

test("width - getter (document)", function() {
    var el = $(document);
    //log(bodyWidth());
    ok(el.width() !=  null, "element.width() doesnt return null");
    equal(typeof el.width(),"number", "element.width() returns a number");
});

test("width - setter", function() {
    var el = $('#dimensions-setter'); 

    el.width(79);
    equals(el.width(), 79, "width set properly")
});

test( "innerWidth - getter", function() {
    var el = $( "#dimensions" );

    equals( el.innerWidth(), 122, "getter passthru" );
    el.hide();
    equals( el.innerWidth(), 122, "getter passthru when hidden" );
});

test( "innerWidth - setter", function() {
    var el = $( "#dimensions" );

    el.innerWidth( 120 );
    equals( el.width(), 98, "width set properly" );
    el.hide();
    el.innerWidth( 100 );
    equals( el.width(), 78, "width set properly when hidden" );
});

test( "outerWidth - getter", function() {
    var el = $( "#dimensions" );

    equals( el.outerWidth(), 140, "getter passthru" );
    el.hide();
    equals( el.outerWidth(), 140, "getter passthru when hidden" );
});

test( "outerWidth - setter", function() {
    var el = $( "#dimensions" );

    el.outerWidth( 130 );
    equals( el.width(), 90, "width set properly" );
    el.hide();
    el.outerWidth( 120 );
    equals( el.width(), 80, "width set properly when hidden" );
});

test( "outerWidth(true) - getter", function() {
    var el = $( "#dimensions" );

    equals( el.outerWidth(true), 154, "getter passthru w/ margin" );
    el.hide();
    equals( el.outerWidth(true), 154, "getter passthru w/ margin when hidden" );
});

test( "outerWidth(true) - setter", function() {
    var el = $( "#dimensions" );

    el.outerWidth( 130, true );
    equals( el.width(), 76, "width set properly" );
    el.hide();
    el.outerWidth( 120, true );
    equals( el.width(), 66, "width set properly when hidden" );
});

test("height - getter (document)", function() {
    var el = $(document);

    ok(el.height() !=  null, "element.height() doesnt return null");
    equal(typeof el.height(),"number", "element.height() returns a number");
});

test("height - getter (created element)", function() {
    var el = $("<div></div>");

    ok(el.height() !=  null, "element.height() doesnt return null");
    equal(typeof el.height(),"number", "element.height() returns a number");
    el.remove();
});

test("height - setter", function() {
    var el = $('#dimensions-setter'); 

    el.height(179);
    equals(el.height(), 179, "height set properly")
});

test( "innerHeight - getter", function() {
    var el = $( "#dimensions" );

    equals( el.innerHeight(), 70, "getter passthru" );
    el.hide();
    equals( el.innerHeight(), 70, "getter passthru when hidden" );
});

test( "innerHeight - setter", function() {
    var el = $( "#dimensions" );

    el.innerHeight( 60 );
    equals( el.height(), 40, "height set properly" );
    el.hide();
    el.innerHeight( 50 );
    equals( el.height(), 30, "height set properly when hidden" );
});

test( "outerHeight - getter", function() {
    var el = $( "#dimensions" );

    equals( el.outerHeight(), 86, "getter passthru" );
    el.hide();
    equals( el.outerHeight(), 86, "getter passthru when hidden" );
});

test( "outerHeight - setter", function() {
    var el = $( "#dimensions" );

    el.outerHeight( 80 );
    equals( el.height(), 44, "height set properly" );
    el.hide();
    el.outerHeight( 70 );
    equals( el.height(), 34, "height set properly when hidden" );
});

test( "outerHeight(true) - getter", function() {
    var el = $( "#dimensions" );

    equals( el.outerHeight(true), 98, "getter passthru w/ margin" );
    el.hide();
    equals( el.outerHeight(true), 98, "getter passthru w/ margin when hidden" );
});

test( "outerHeight(true) - setter", function() {
    var el = $( "#dimensions" );

    el.outerHeight( 90, true );
    equals( el.height(), 42, "height set properly" );
    el.hide();
    el.outerHeight( 80, true );
    equals( el.height(), 32, "height set properly when hidden" );
});

})(jQuery);
