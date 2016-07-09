"use strict";

var IndexApp = {
	searchKeyword: '',
	selectedItem: null,
	element: {
		search: '#search',
		sessionNameInput: '#sessionNameInput',
		startSessionButton: '#startSessionButton',
		startBlankSessionButton: '#startBlankSessionButton',
		buildingDisplay: '#buildingDisplay',
		blankModeSettingDisplay: '#blankModeSettingDisplay',
		goBlankSessionButton: '#goBlankSessionButton',
		roomNumberSelect: '#roomNumberSelect',
		activeSessionDisplay: '#activeSessionDisplay',
	},

	setBuilding: function(buildingItem){
		IndexApp.selectedItem = buildingItem;

		if(buildingItem !== null){
			$(IndexApp.element.buildingDisplay).find('h3').html(buildingItem.label);
			$(IndexApp.element.buildingDisplay).find('span').html(Locale.words.currentSelect);
			$(IndexApp.element.sessionNameInput).val('Go '+IndexApp.searchKeyword);
			$(IndexApp.element.startSessionButton).removeAttr('disabled');
			$(IndexApp.element.buildingDisplay).slideDown(300);
		}else{
			$(IndexApp.element.buildingDisplay).hide();
			$(IndexApp.element.sessionNameInput).val('');
			$(IndexApp.element.startSessionButton).attr('disabled', 'disabled');
		}
	},

	startSession: function(sessionId){
		window.location = '/'+SidebarLocale.current+'/work/session/'+sessionId;
	},

	startBlankSession: function(){
		window.location = '/'+SidebarLocale.current+'/work/blank?r='+$(IndexApp.element.roomNumberSelect).val();
	},

	cancelOfConfirm: function(button){
		if(button.attr('confirm') !== undefined){
			button.find('.resetText').html(Locale.words.resetButton);
			button.removeAttr('confirm');
		}
	},

	updateBlankSession: function(){
		var blankSession = localStorage.getItem("_b");

		if(blankSession !== null){
			$(IndexApp.element.activeSessionDisplay).show();
			$(IndexApp.element.goBlankSessionButton).html(Locale.words.continueSession);
		}else{
			$(IndexApp.element.activeSessionDisplay).slideUp(200);
			$(IndexApp.element.goBlankSessionButton).html(Locale.words.go);
		}
	},

	clearSessionStorage: function(){
		var sessionIds = [];
		var sessionData = [];
	    for(var i=0; i<deadSession.length; i++){
	    	var key = '_s'+deadSession[i];
	    	var data = localStorage.getItem(key);

	    	sessionIds.push(deadSession[i]);
	    	sessionData.push(data);

	    	localStorage.removeItem(key);
	    }

	    if(sessionIds.length > 0){
	    	var param = {
	    		id: sessionIds,
	    		data: sessionData
	    	};
	    	$.ajax({
				url: '/ajax/session_save',
				data: param,
				method: "POST",
				dataType: "json"
			});
	    }
	},

};

$( document ).ready(function() {

    var options = {

		url: function(phrase) {
			$(IndexApp.element.search).tooltip('remove');
			IndexApp.searchKeyword = phrase;
			return "ajax/search?query=" + phrase;
		},

		getValue: function(element) {
			if(element === false){
				return Locale.words.resultNotFound.replace('`WORD`', IndexApp.searchKeyword);
			}
			return IndexApp.searchKeyword + Locale.words.building;
		},

		minCharNumber: 2,
		requestDelay: 400,
		listLocation: function(json){
			var notFound = [false];

			// GA #1
			ga('send', 'event', 'Search Keyword', IndexApp.searchKeyword);
			
			if(json.length == 0){
				return notFound;
			}

			return json;
		},

		list: {
			onChooseEvent: function() {
				var selectedData = $(IndexApp.element.search).getSelectedItemData();

				if(selectedData === false){
					window.location = '/'+SidebarLocale.current+'/request';
					return;
				}

				var selectedItem = {
					id: selectedData.id,
					label: IndexApp.searchKeyword + Locale.words.building
				};

				IndexApp.setBuilding(selectedItem);

				$(IndexApp.element.search).val('').blur();

				// GA #2
				ga('send', 'event', 'Index Search', 'Selected result', ""+selectedData.id);
			},

		}

	};

	$(IndexApp.element.search).easyAutocomplete(options);
	$(IndexApp.element.search).on('blur', function(e){
		$(IndexApp.element.search).tooltip('remove');
	});

	$(IndexApp.element.buildingDisplay).find('.ion-android-close').click(function(e){

		// GA #6
		ga('send', 'event', 'Index Normal Mode', 'Cancel building selection');
		IndexApp.setBuilding(null);
	});

	$(IndexApp.element.startBlankSessionButton).click(function(e){
		$(IndexApp.element.blankModeSettingDisplay).slideToggle(300);
	});

	$(IndexApp.element.goBlankSessionButton).click(function(e){
		// GA #7
		ga('send', 'event', 'Index Blank Mode', 'Start session');

		IndexApp.startBlankSession();
	});

	$(IndexApp.element.activeSessionDisplay).find('.delete-btn').click(function(e){
		if($(this).attr('confirm') !== undefined){
			localStorage.removeItem('_b');
			Materialize.toast(Locale.words.removeSession, 2000);

			// GA #10
			ga('send', 'event', 'Index Blank Mode', 'Confirm delete');
			
			SidebarApp.updateSidebarBlankSession();
		}else{
			$(this).find('.resetText').html(Locale.words.confirmResetButton);
			$(this).attr('confirm', 'confirm');

			// GA #9
			ga('send', 'event', 'Index Blank Mode', 'Attempt delete');

			setTimeout(IndexApp.cancelOfConfirm.bind(null, $(this)), 5000);
		}
	});

	$(IndexApp.element.startSessionButton).click(function(e){
		var _this = this;
		$(this).find('span').show();
		$(this).attr('disabled', 'disabled');

		// GA #4
		ga('send', 'event', 'Index Normal Mode', 'Start button clicked');

		var param = {
			building: IndexApp.selectedItem.id,
			name: $(IndexApp.element.sessionNameInput).val(),
		};
		$.ajax({
			url: '/ajax/work',
			data: param,
			method: "POST",
			dataType: "json",
			complete: function(json){
				$(_this).find('span').hide();
			},
			success: function(json){
				console.log('success');

				IndexApp.startSession(json.session.id);
			},
			error: function(e){
				console.log('error');

				// GA #5
				ga('send', 'event', 'Index Normal Mode', 'Work session full');

				var errJson = JSON.parse(e.responseText);

				Materialize.toast(errJson.error, 5000);

				$(_this).removeAttr('disabled');
			}
		});
	});

	$(IndexApp.element.search).tooltip();

	$(IndexApp.element.sessionNameInput).on('focus', function(e){
		// GA #3
		ga('send', 'event', 'Index Normal Mode', 'Change session name');
	});

	$(IndexApp.element.roomNumberSelect).on('change', function(e){
		// GA #8
		ga('send', 'event', 'Index Blank Mode', 'Change room number', e.target.value);
	});

	IndexApp.setBuilding(null);
	IndexApp.updateBlankSession();
	IndexApp.clearSessionStorage();
});