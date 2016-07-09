"use strict";

$(document).ready(function(){
	$('#addMoreLink').click(function(e){
		// GA #11
		ga('send', 'event', 'Profile', 'Add more clicked');
	});
});