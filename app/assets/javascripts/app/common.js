"use strict";

Number.prototype.intToAlphabet = function(){
	var map = {0:'A',1:'B',2:'C',3:'D',4:'E',5:'F',6:'G',7:'H',8:'I',9:'J',A:'K',B:'L',C:'M',D:'N',E:'O',F:'P',G:'Q',H:'R',I:'S',J:'T',K:'U',L:'V',M:'W',N:'X',O:'Y',P:'Z'};
	var str = this.toString(26);
	var result = str.toUpperCase().split("").map(function(c, i){ return map[c]; });
	return result.join("");
}

var SidebarApp = {
	element: {
		blankActiveDisplay: '#blankActiveDisplay',
		continueBlankLink: "#continueBlankLink",
		newBlankLink: "#newBlankLink",
		resetBlankLink: "#resetBlankLink",
		discardBlankLink: "#discardBlankLink",
		completeLink: '.complete-link',
		finishAllLink: '#finishAllLink',
	},

	updateSidebarBlankSession: function(){
		var blankSession = localStorage.getItem("_b");
		if(blankSession !== null){
			$(SidebarApp.element.blankActiveDisplay).removeClass('pending').addClass('started');
			if(PageSettings.controller == "work" && PageSettings.action == "blank"){
				$(SidebarApp.element.continueBlankLink).hide();
				$(SidebarApp.element.resetBlankLink).hide();
				$(SidebarApp.element.newBlankLink).hide();
				$(SidebarApp.element.discardBlankLink).show();
			}else{
				$(SidebarApp.element.continueBlankLink).show();
				$(SidebarApp.element.resetBlankLink).show();
				$(SidebarApp.element.newBlankLink).hide();
				$(SidebarApp.element.discardBlankLink).hide();
			}
		}else{
			$(SidebarApp.element.blankActiveDisplay).removeClass('started').addClass('pending');
			$(SidebarApp.element.continueBlankLink).hide();
			$(SidebarApp.element.resetBlankLink).hide();
			$(SidebarApp.element.newBlankLink).show();
			$(SidebarApp.element.discardBlankLink).hide();
		}

		if(typeof(IndexApp) !== "undefined"){
			IndexApp.updateBlankSession();
		}
	},

	cancelOfConfirm: function(button, resetText){
		if(button.attr('confirm') !== undefined){
			button.find('.resetText').html(resetText);
			button.removeAttr('confirm');
		}
	},
};

$( document ).ready(function() {

	$(SidebarApp.element.resetBlankLink).click(function(e){
		if($(this).attr('confirm') !== undefined){
			localStorage.removeItem('_b');
			Materialize.toast(SidebarLocale.words.removeSession, 2000);

			SidebarApp.updateSidebarBlankSession();
		}else{
			$(this).find('.resetText').html(SidebarLocale.words.confirmResetButton);
			$(this).attr('confirm', 'confirm');

			setTimeout(SidebarApp.cancelOfConfirm.bind(null, $(this)), 5000);
		}
	});

	$('#open-right').sideNav({
        menuWidth: 240, // Default is 240
        edge: 'right', // Choose the horizontal origin
        closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });

    $(SidebarApp.element.discardBlankLink).hide().click(function(e){
    	if($(this).attr('confirm') !== undefined){
			localStorage.removeItem('_b');
			Materialize.toast(SidebarLocale.words.removeSession, 2000);
			SidebarApp.cancelOfConfirm($(this));

			window.location = "/"+SidebarLocale.current;
		}else{
			$(this).find('.resetText').html(SidebarLocale.words.confirmResetButton);
			$(this).attr('confirm', 'confirm');

			setTimeout(SidebarApp.cancelOfConfirm.bind(null, $(this), SidebarLocale.words.resetButton), 5000);
		}
    });

    $(SidebarApp.element.finishAllLink).click(function(e){
    	if($(this).attr('confirm') !== undefined){
			return true;
		}else{
			$(this).find('.resetText').html(SidebarLocale.words.confirmResetButton);
			$(this).attr('confirm', 'confirm');

			setTimeout(SidebarApp.cancelOfConfirm.bind(null, $(this), SidebarLocale.words.finishAll), 5000);

			return false;
		}
    });

    $(SidebarApp.element.completeLink).click(function(e){
        var answer = confirm(SidebarLocale.words.warnFinish);
	    
	    return answer;
    });

    SidebarApp.updateSidebarBlankSession();
});