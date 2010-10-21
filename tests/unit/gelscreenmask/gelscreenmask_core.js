/*
 * gelscreenmask_core.js
 */

(function($) {

module('gelscreenmask: core');

test('create returns the element', function() {
	var mask = $('.box-1').gelscreenmask();
	equals( mask.selector, '.box-1', 'creating the mask should return the element');
	mask.gelscreenmask('destroy');
});

test('create hides the element', function() {
	var mask = $('.box-1').gelscreenmask();
	equals( $('.box-1:hidden').length, 1, 'create method should have hidden 1 element (.box-1)');
	mask.gelscreenmask('destroy');
});

test('create shouldnt be passed a negative zDiff', function() {
	expect(1);
	try {
		var mask = $('.box-1').gelscreenmask({zDiff: -10});
	} catch(e) {
		equals( true, true, 'this should always throw happen');
	}
});

// test('create updates the zIndex', function() {
// 	expect(1);
// 	try {
// 		var mask = $('.box-1').gelscreenmask({zDiff: -10});
// 	} catch(e) {
// 		equals( true, true, 'this should always throw happen');
// 	}
// });

test('options: create doesnt hide the element', function() {
	//show for the test
	$('.box-1').css('display', 'block');
	var mask = $('.box-1').gelscreenmask({hideElement: false});
	equals( $('.box-1').css('display'), 'block', 'create method should not have hidden 1 element (.box-1)');
	//unshow
	$('.box-1').css('display', 'none');
	mask.gelscreenmask('destroy');
});

})(jQuery);