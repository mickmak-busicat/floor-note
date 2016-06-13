"use strict";

var InputMixin = {
	
	_enterToBlur: function(e){
		if(e.which == 13) {
			e.target.blur();
		}
	},

	_addHook: function(hookId, callback){
		if(typeof(this[hookId]) === "undefined" ){
			this[hookId] = [];
		}

		this[hookId].push(callback);
	},

	_releaseAllHooks: function(hookId){
		this._triggerAllHooks(hookId);
		this[hookId] = [];
	},

	_triggerAllHooks: function(hookId){
		if(typeof(this[hookId]) !== "undefined" ){
			for(var i=0; i<this[hookId].length; i++){
				this[hookId][i]();
			}
		}
	}

};