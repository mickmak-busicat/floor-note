$( document ).ready(function() {

	$('#upgradeButton').click(function(e){
		var _this = this;
		$(this).find('span').show();
		$(this).attr('disabled', 'disabled');

		// GA #50
		ga('send', 'event', 'Upgrade', 'Upgrade clicked');

		$.ajax({
			url: '/ajax/account_upgrade',
			method: "POST",
			dataType: "json",
			complete: function(json){
				$(_this).find('span').hide();
			},
			success: function(json){
				console.log('success');

				Materialize.toast(Locale.words.success_upgrade, 3000, 'toast-success');
				$(_this).html(Locale.words.success_upgrade);

				setTimeout(function(){
					window.location = '/'+SidebarLocale.current+'/profile';
				}, 3000);

			},
			error: function(e){
				console.log('error');

				var errJson = JSON.parse(e.responseText);

				Materialize.toast(errJson.error, 5000);

				$(_this).removeAttr('disabled');
			}
		});
	});

});