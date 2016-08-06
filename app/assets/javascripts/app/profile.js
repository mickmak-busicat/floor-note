"use strict";

$(document).ready(function(){
	var sent = false;
	$('#addMoreLink').click(function(e){
		// GA #11
		ga('send', 'event', 'Profile', 'Add more clicked');
	});

	$('#verifyButton').click(function(e){
		if(!sent){
			sent = true;

			// GA #49
			ga('send', 'event', 'Profile', 'Verify email clicked');

			$('#verifyDiv').addClass('verified').html(Locale.words.confirmation_sent);

			$.ajax({
				url: '/ajax/confirm_email',
				method: "POST",
				dataType: "json",
			});
		}
	});
});