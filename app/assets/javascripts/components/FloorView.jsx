"use strict";

var FloorView = React.createClass({

	mixins: [InputMixin, FloorViewMixin],

	getDefaultProps: function(){
		return {
			'mode': 'NORMAL',
			'serverInterval': 10, // min
		};
	},

	getInitialState: function() {
		return {
			'objects': {},
			'floorViewIndex': 0,
			'modalLabel': '',
			'modalNotes': '',
			'modalSessionLabel': '',
			'currentModalRoom': 0,

			'workLabel': '',
			'scale': 1,
			'isReportPanelShow': false,
			'reportSelect': 'none',
		};
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		this._saveSession(nextState);

		return true;
	},

	componentDidUpdate: function(prevProps, prevState){
		this._adjustControlWidth();
		$('#appUseSpan').find('.floor-label').html(this._getFloorData(this.state.floorViewIndex, 'name') + (this.props.mode=='VIEW'?Locale.words.viewMode:''));
		$('#appUseSpan').find('.floor-name').html(this.state.workLabel);
		// this._triggerAllHooks('preloadIcon');
	},

	componentDidMount: function(){
		var _this = this;

		this._constructSession();
		this._bindEvents();
	},

	_bindEvents: function(){
		var _this = this;

		$('#roomRates').on('hide.bs.modal', function(e){
			$('.room-object.active').removeClass("active");
		});

		$('#appUseSpan').append($('<span>').addClass('header-action').append($('<span>').addClass('floor-name editable').html('')).append($('<span>').addClass('floor-name-edit').append($('<i>').addClass('ion-edit'))));
		$('<span>').append($('<span>').addClass('small floor-label').html('1/F')).appendTo($('#appUseSpan'));

		if(this.props.mode == 'VIEW'){
			$('#appUseSpan').find('i').hide();
		}else{
			$('#appUseSpan').find('.header-action').click(function(e){
				$(_this.refs.editNameModal).modal('show');

				// GA #22
				ga('send', 'event', 'Normal Mode', 'Session name update clicked');

				_this.setState({'modalSessionLabel': _this.state.workLabel});
			});
		}

		this._serverSyncSession();
	},

	_constructSession: function(){
		var numberOfRooms = parseInt(this.props.rm);
		var objects = {};
		var currentFloor = {};
		var floorViewIndex = 1;
		var scale = 1;
		var previousSession = localStorage.getItem(this.props.normalModeStoreKey);

		if(previousSession === "" || previousSession === null){
			floorViewIndex = this.props.buildingData.building.floors[0].seq;
		}else{
			previousSession = JSON.parse(previousSession);
			objects = previousSession.objects;
			floorViewIndex = previousSession.floorViewIndex;
			scale = previousSession.scale;
		}

		$(this.refs.containerBody).css('height', ($(window.top).height()-126)+'px');
		this._adjustControlWidth();
		this._constructCachedImage();

		$('body').addClass("primary-color");
		this.setState({'objects': objects, 'floorViewIndex': floorViewIndex, 'workLabel': this.props.workLabel, 'scale': scale});
	},

	_constructCachedImage: function(){
		var _this = this;
		this.cachedImage = {
			defaultSet: [],
			customSet: [],
			loadedCount: 1,
			loadDone: false,
		};

		$.each(this.props.defaultIconSet, function(index, key){
			if(key === ""){
				_this.cachedImage.defaultSet.push(null);
			}else{
				var image = new Image();
				image.src = key;
				image.onload = _this._loadImageDone;

				_this.cachedImage.defaultSet.push(image);
			}
		});

		var screenBlock = $('<div>').addClass('screen-block real-block primary-color');
		var cell = $('<div>').addClass('cell').appendTo(screenBlock);
		var info = $('<div>').addClass('info').append($('<img>').attr('src', Assets.preloader)).append(Locale.words.prepareResource).appendTo(cell);
		$('body').append(screenBlock);

		setTimeout(function(){
			if($('.screen-block.real-block').length > 0){
				$('<div>').addClass('info small').append(Locale.words.resourceLoadSlow.split('`BR`').join('<br>')).append($('<a>').attr('href', '').html(Locale.words.loadSlowReload)).append(Locale.words.loadSlowOr.split('`BR`').join('<br>')).append($('<a>').attr('href', '/'+SidebarLocale.current+'/improve').html(Locale.words.loadSlowReport)).appendTo(cell);
			}
		}, 10000);

		// TODO: custom icon set init here
	},

	_loadImageDone: function(){
		var allImagesCount = this.cachedImage.defaultSet.length + this.cachedImage.customSet.length
		this.cachedImage.loadedCount ++;

		if(this.cachedImage.loadedCount == allImagesCount){
			this.cachedImage.loadDone = true;
			this._releaseAllHooks('preloadIcon');

			$('.screen-block.real-block').remove();
		}
	},

	_saveSession: function(rawObject){
		var state = JSON.stringify(rawObject);

		localStorage.setItem(this.props.normalModeStoreKey, state);
	},

	_serverSyncSession: function(){
		var _this = this;
		var interval = 60 * 1000 * this.props.serverInterval;

		setTimeout(function(){
			var stateString = JSON.stringify(_this.state);

			var sessionIds = [_this.props.id];
			var sessionData = [stateString];

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

			_this._serverSyncSession();
		}, interval);
		
	},

	/**
	 *
	 * Show popup operation for a room.
	 * @param {Integer} roomId
	 *
	 */

	_popForRoom: function(roomId){
		$('#roomRates').modal('show');
		var room = this._findFloorObjects(this.state.floorViewIndex, roomId);

		// GA #26
		ga('send', 'event', 'Normal Mode', 'Room detail popup opened');

		var state = {
			'currentModalRoom': roomId,
			'modalNotes': room.notes===undefined?'':room.notes,
			'modalLabel': room.label,
			'isReportPanelShow': false,
		};

		// TODO: get room rates

		this.setState(state);
	},

	_adjustControlWidth: function(){
		var controlWidth = 0;
		var windowWidth = $(window.top).width();
		var controls = $(this.refs.controlWrapper).children();

		$.each(controls, function(index, c){
			controlWidth += $(c).width() + 5;
		});

		if(controlWidth < windowWidth){
			controlWidth = windowWidth;
		}

		$(this.refs.controlWrapper).css('width', controlWidth+'px');
	},

	_nextRoomStatus: function(roomId, currentStatus){
		if(this.props.mode == 'VIEW'){
			// GA #25
			ga('send', 'event', 'Normal Mode (View)', 'Attempt to change room status');

			return this._getStatusIcon(currentStatus);
		}
		var currentIndex = ((currentStatus + 1)==this.props.defaultIconSet.length)?0:(currentStatus+1);
		this._updateRoomData(roomId, 'status', currentIndex);

		// GA #24
		ga('send', 'event', 'Normal Mode', 'Change room status');
	
		return this._getStatusIcon(currentIndex);
	},

	_updateModalLabel: function(e){
		// GA #33
		ga('send', 'event', 'Normal Mode', 'Room label updated');

		this.setState({'modalLabel': e.target.value});
	},

	_updateRoomLabel: function(e){
		if(this.props.mode == 'VIEW'){
			return ;
		}
		Materialize.toast(Locale.words.labelUpdate, 2000);
		this._updateRoomData(this.state.currentModalRoom, 'label', e.target.value);
	},

	_updateModalNotes: function(e){
		// GA #34
		ga('send', 'event', 'Normal Mode', 'Room notes updated');

		this.setState({'modalNotes': e.target.value});
	},

	_updateRoomNotes: function(e){
		if(this.props.mode == 'VIEW'){
			return ;
		}
		Materialize.toast(Locale.words.noteUpdate, 2000);
		this._updateRoomData(this.state.currentModalRoom, 'notes', e.target.value);
	},

	_updateSessionModalLabel: function(e){
		// GA #23
		ga('send', 'event', 'Normal Mode', 'Update session label');

		this.setState({'modalSessionLabel': e.target.value});
	},

	_updateFloorLabel: function(e){
		var label = e.target.value;
		Materialize.toast(Locale.words.floorLabelUpdate, 2000);
		
		var param = {
			name: label,
			id: this.props.id
		};
		$.ajax({
			url: '/ajax/update_session_name',
			data: param,
			method: "POST",
			dataType: "json",
			complete: function(json){
				
			},
			success: function(json){
				console.log('success');
				console.log(json);
			},
			error: function(e){
			}
		});

		// Update sidebar label
		$('.current-session-li').next('span').html(label);
		this.setState({'workLabel': label});
	},

	_getBackgroundImage: function(roomIndex){
		var iconDisplay = this.props.defaultIconSet[this._findFloorObjects(this.state.floorViewIndex, roomIndex).status];
		if(iconDisplay === ""){
			return "";
		}
		return iconDisplay;
	},

	_updateRoomData: function(roomId, key, value){
		var objects = $.extend(true, {}, this.state.objects);
		if(objects[roomId] === undefined){
			objects[roomId] = {};
		}
		objects[roomId][key] = value;
		this.setState({'objects': objects});
	},

	_updateReportSelect: function(e){
		this.setState({'reportSelect': e.target.value});
	},

	_getFloorData: function(floorSeq, key){
		var result = null;
		var floors = this.props.buildingData.building.floors;

		$.each(floors, function(index, floor){
			if(floor.seq == floorSeq){
				result = floor[key];
				return false;
			}
		});
		
		return result;
	},

	_findFloorObjects: function(floorIndex, roomId){
		var _this = this;
		var result = null;
		var floors = this.props.buildingData.building.floors;
		var targetFloor = null;

		$.each(floors, function(index, floor){
			if(floor.seq == floorIndex){
				var objects = floor.floor_objects;
				targetFloor = floor;

				if(roomId !== undefined){
					$.each(objects, function(i, obj){
						if(obj.id == roomId){
							result = $.extend(obj, (_this.state.objects[obj.id] || {}));
							return false;
						}
					});
				}

				return false;
			}
		});

		if(roomId !== undefined){
			return result;
		}

		return targetFloor;
	},

	_switchFloor: function(e){
		// GA #31
		ga('send', 'event', 'Normal Mode', 'Go to floor used', ""+e.target.value);

		this._goToFloor(e.target.value);
	},

	_goToFloor: function(floorIndex){
		Materialize.toast(Locale.words.onFloor.replace('`NAME`', this._getFloorData(floorIndex, 'name')), 2000);
		this.setState({'floorViewIndex': floorIndex});
	},

	_goUpFloor: function(){
		var targetFloor = -1;
		var currentFloor = this.state.floorViewIndex;
		var floors = this.props.buildingData.building.floors;

		$.each(floors, function(index, floor){
			if(floor.seq > currentFloor){
				if(targetFloor > floor.seq || targetFloor == -1){
					targetFloor = floor.seq;
				}
			}
		});

		// GA #27
		ga('send', 'event', 'Normal Mode', 'Go up floor clicked');

		if(targetFloor == -1){
			Materialize.toast(Locale.words.cannotGoUp, 2000);
		}else{
			this._goToFloor(targetFloor);
		}
	},

	_goDownFloor: function(){
		var targetFloor = -1;
		var currentFloor = this.state.floorViewIndex;
		var floors = this.props.buildingData.building.floors;

		$.each(floors, function(index, floor){
			if(floor.seq < currentFloor){
				if(targetFloor < floor.seq || targetFloor == -1){
					targetFloor = floor.seq;
				}
			}
		});

		// GA #28
		ga('send', 'event', 'Normal Mode', 'Go down floor clicked');

		if(targetFloor == -1){
			Materialize.toast(Locale.words.cannotGoDown, 2000);
		}else{
			this._goToFloor(targetFloor);
		}
	},

	_getCurrentFloorObject: function(){
		var _this = this;
		var result = [];

		$.each(this.props.buildingData.building.floors, function(index, floor){
			if(floor.seq == _this.state.floorViewIndex){
				result = floor.floor_objects;
				return false;
			}
		});

		return result;
	},

	_getStatusIcon: function(index, defaultSet){
		var set = (defaultSet===false)?'custom':'default';
		var icon = null;
		
		if(set === 'default'){
			icon = this.cachedImage.defaultSet[index] || null;
		}else if(set === 'custom'){
			icon = this.cachedImage.customSet[index] || null;
		}

		return icon;
	},


	_scaleUp: function(){
		var scale = this.state.scale;

		// GA #29
		ga('send', 'event', 'Normal Mode', 'Zoom in clicked');

		if(scale < 1.5){
			this.setState({'scale': scale + 0.1});
		}else{
			Materialize.toast(Locale.words.cannotScaleUp, 2000);
		}
	},

	_scaleDown: function(){
		var scale = this.state.scale;

		// GA #30
		ga('send', 'event', 'Normal Mode', 'Zoom out clicked');

		if(scale > 0.5){
			this.setState({'scale': scale - 0.1});
		}else{
			Materialize.toast(Locale.words.cannotScaleDown, 2000);
		}
	},

	_getScale: function(){
		return this.state.scale;
	},

	_isResourceReady: function(){
		return this.cachedImage.loadDone;
	},

	_setDisplayReporPanel: function(show){
		// GA #35
		ga('send', 'event', 'Normal Mode', 'Report button clicked', show?"1":"0");

		$(this.refs.reportDetail).val('');
		this.setState({'isReportPanelShow': show, 'reportSelect': 'none'});
	},

	_sendReport: function(e){
		var _this = this;
		var param = {
			reason: $(this.refs.reportReasonSelect).val(),
			comment: $(this.refs.reportDetail).val()
		};
		var reportType = $(this.refs.reportTypeSelect).val();

		// GA #36
		ga('send', 'event', 'Normal Mode', 'Report send clicked');

		if(reportType == 'building'){
			param.building_id = this.props.buildingData.building.id;
		}else if(reportType == 'floor'){
			param.floor_id = this._getFloorData(this.state.floorViewIndex, 'id');
		}else if(reportType == 'room'){
			param.room_id = this.state.currentModalRoom;
		}

		$.ajax({
			url: '/ajax/report_problem',
			data: param,
			method: "POST",
			dataType: "json",
			complete: function(json){
				Materialize.toast(Locale.words.thanksReport, 2000);
				_this.setState({'isReportPanelShow': false});
			},
			success: function(json){

			},
			error: function(e){
			}
		});
	},

	_rateRoom: function(score){
		Materialize.toast("Coming soon...", 3000);

		// GA #32
		ga('send', 'event', 'Normal Mode', 'Rate room clicked', score+"");
	},


	/**
	 *
	 * Render floor objects
	 * @return {FloorObject[]} resultArray
	 *
	 */
	
	_renderFloorObject: function(){
		var _this = this;
		var resultArray = [];
		var floorObjects = this._getCurrentFloorObject();
		var maxX = 0;
		var maxY = 0;
		var margin = 50;
		$.each(floorObjects, function(index, obj){
			var finalObject = $.extend(obj, (_this.state.objects[obj.id] || {}));
			var boundaryX = finalObject.x + (finalObject.width || 100);
			var boundaryY = finalObject.y + (finalObject.height || 100);

			maxX = (boundaryX > maxX)?boundaryX:maxX;
			maxY = (boundaryY > maxY)?boundaryY:maxY;

			if(finalObject.object_type == 'room'){
				resultArray.push(<FloorRoom _pGetScale={_this._getScale} _pIsResourceReady={_this._isResourceReady} _pAddImageLoaderHook={_this._addHook} _pNextRoomStatus={_this._nextRoomStatus} _pGetRoomIcon={_this._getStatusIcon} _pGetBackgroundImage={_this._getBackgroundImage} _pOpenModal={_this._popForRoom} key={finalObject.id} id={finalObject.id} x={finalObject.x} y={finalObject.y} notes={finalObject.notes!==''?finalObject.notes:''} label={finalObject.label} status={finalObject.status} />);
			}else if(finalObject.object_type == 'walkable'){
				resultArray.push(<FloorWalkable _pGetScale={_this._getScale} key={finalObject.id} id={finalObject.id} x={finalObject.x} y={finalObject.y} width={finalObject.width} height={finalObject.height} />);
			}else if(finalObject.object_type == 'block'){
				resultArray.push(<FloorBlock _pGetScale={_this._getScale} key={finalObject.id} id={finalObject.id} x={finalObject.x} y={finalObject.y} width={finalObject.width} height={finalObject.height} />);
			}else if(finalObject.object_type == 'stair'){
				resultArray.push(<FloorStair _pGetScale={_this._getScale} key={finalObject.id} id={finalObject.id} x={finalObject.x} y={finalObject.y} direction={finalObject.direction} />);
			}else if(finalObject.object_type == 'elevator'){
				resultArray.push(<FloorElevator _pGetScale={_this._getScale} key={finalObject.id} id={finalObject.id} x={finalObject.x} y={finalObject.y} direction={finalObject.direction} />);
			}else {
				console.log('Unknown object type: '+ finalObject.object_type);
			}
		});

		resultArray.push(<FloorBlock _pGetScale={_this._getScale} key="screenMargin" id="margin" x={maxX+margin} y={maxY+margin} width={1} height={1} />);

		return resultArray;
	},

	_renderFloorSelect: function(){
		var _this = this;
		var result = [];
		var floors = this.props.buildingData.building.ordered_floors;

		$.each(floors, function(index, floor){
			result.unshift(<option key={floor.id} value={floor.seq} disabled={_this.state.floorViewIndex==floor.seq}>{floor.name}</option>);
		});

		return result;
	},

	_renderReasonSelect: function(){
		var result = [];
		var reasons = {
			'building': Locale.words.reportBuildingReasons,
			'floor': Locale.words.reportFloorReasons,
			'room': Locale.words.reportRoomReasons,
		};

		var arr = reasons[this.state.reportSelect];
		$.each(arr, function(index, r){
			result.push(<option key={index} value={r}>{r}</option>);
		});

		result.push(<option key="other" value={Locale.words.reportOther}>{Locale.words.reportOther}</option>);

		return result;
						
	},

	render: function(){
		var listEl = [];
		return <div>
			<div className="opacity-modal modal fade" ref="editNameModal" tabindex="-1" role="dialog">
			  <div className="modal-content">
				  <div className="modal-body controls">
				  	<div>{Locale.words.workLabel}</div>
				  	<input type="text" maxLength="15" value={this.state.modalSessionLabel} onKeyPress={this._enterToBlur} onChange={this._updateSessionModalLabel} onBlur={this._updateFloorLabel} />
				  </div>
				  <div className="modal-footer">
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" data-dismiss="modal">{Locale.words.close}</button>
				  </div>
			  </div>
			</div>
			<div className="opacity-modal modal fade" id="roomRates" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
			  <div className="modal-content">
				  <div className="modal-header compact">
				  	<button type="button" className="btn btn-lg waves-effect waves-green right report-btn" onClick={this._setDisplayReporPanel.bind(null, true)}><span>{Locale.words.reportProblem}</span></button>
				    <h4 className="modal-title" id="myModalLabel">{Locale.words.modalTitle}</h4>
				  </div>
				  <div className="modal-footer" hidden={this.state.isReportPanelShow}>
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" data-dismiss="modal">{Locale.words.close}</button>
				  </div>
				  <div className="modal-body" ref="reportPanel" hidden={!this.state.isReportPanelShow}>
				  	<button type="button" className="btn btn-lg waves-effect waves-green right report-btn" onClick={this._setDisplayReporPanel.bind(null, false)}><span>{Locale.words.cancelReport}</span></button>
				  	<p>{Locale.words.reportPartTitle}</p>
				  	<select className="browser-default" onChange={this._updateReportSelect} value={this.state.reportSelect} ref="reportTypeSelect">
				  		<option value="none" disabled="disabled">{Locale.words.reportChoose}</option>
						<option value="building">{Locale.words.reportThisBuilding}</option>
						<option value="floor">{Locale.words.reportThisFloor}</option>
						<option value="room">{Locale.words.reportThisRoom}</option>
					</select>
					<div>{Locale.words.reportReasonTitle}</div>
					<select className="browser-default" ref="reportReasonSelect">
						{this._renderReasonSelect()}
					</select>
				  	<div>{Locale.words.reportDetailTitle}</div>
				  	<div className="input-field animated">
						<i className="ion-ios-compose-outline prefix"></i>
						<textarea className="materialize-textarea" maxLength="255" placeholder={Locale.words.reportDetailSuggest} ref="reportDetail"></textarea>
					</div>
				  </div>
				  <div className="modal-body" ref="infoPanel" hidden={this.state.isReportPanelShow}>
				  	<div>
					  	<div className="center rate-title">
					  		Ratings:
					  	</div>
					  	<div>
					  		<div className="center">
					  			<div className="rate-block">
					  				<div>
					  					<span className="rates-label like-rates"><i className="ion-heart"></i> x <span ref="likeRatesDisplay">0</span></span>
					  				</div>
							    	<button type="button" className="btn btn-lg waves-effect waves-red like-btn rate-btn" style={this.props.mode=='VIEW'?{'display': 'none'}:{}} disabled={this.props.mode=='VIEW'} onClick={this._rateRoom.bind(null, 1)}><i className="ion-heart"></i></button> 
							    </div>
							    <div className="rate-block">
							    	<div>
							    		<span className="rates-label dislike-rates"><i className="ion-sad"></i> x <span ref="dislikeRatesDisplay">0</span></span>
							    	</div>
							    	<button type="button" className="waves-effect waves-blue btn btn-lg dislike-btn rate-btn" style={this.props.mode=='VIEW'?{'display': 'none'}:{}} disabled={this.props.mode=='VIEW'} onClick={this._rateRoom.bind(null, -1)}><i className="ion-sad"></i></button>
							    </div>
							    <div className="stats-info small">(Last 7 days)</div>
						    </div>
					    </div>
				    </div>
				  	<div>{Locale.words.modalLabel + ((this.props.u)?'':Locale.words.loginToUse)}</div>
				  	<input type="text" maxLength="10" value={this.state.modalLabel} onChange={this._updateModalLabel} onKeyPress={this._enterToBlur} onBlur={this._updateRoomLabel} disabled={this.props.mode=='VIEW'||!this.props.u} />
				  	<div>{Locale.words.modalNote + ((this.props.u)?'':Locale.words.loginToUse)}</div>
				  	<div className="input-field animated">
						<i className="ion-ios-compose-outline prefix"></i>
						<textarea className="materialize-textarea" maxLength="255" value={this.state.modalNotes} onChange={this._updateModalNotes} onBlur={this._updateRoomNotes} disabled={this.props.mode=='VIEW'||!this.props.u} ></textarea>
					</div>
				  </div>
				  <div className="modal-footer" hidden={this.state.isReportPanelShow}>
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" data-dismiss="modal">{Locale.words.close}</button>
				  </div>
				  <div className="modal-footer" hidden={!this.state.isReportPanelShow}>
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" onClick={this._sendReport} disabled={this.state.reportSelect=='none'}>{Locale.words.sendReport}</button>
				  </div>
			  </div>
			</div>
			<div className="floor-container" ref="containerBody">
				{this._renderFloorObject()}
			</div>
			<div className="floor-controls">
				<div className="wrapper" ref="controlWrapper">
					<div className="control-div fixed-width active" onClick={this._goUpFloor}>
						<span className="control-content">
							<div><i className="ion-arrow-up-a"></i></div>{Locale.words.goUp}
						</span>
					</div>
					<div className="control-div fixed-width active" onClick={this._goDownFloor}>
						<span className="control-content">
							<div>{Locale.words.goDown}</div><i className="ion-arrow-down-a"></i>
						</span>
					</div>
					<div className="control-div">
						<span className="control-content">
							<select className="browser-default" value={this.state.floorViewIndex} onChange={this._switchFloor}>
								<option disabled="disabled" value="0">{Locale.words.floorSelect}</option>
								{this._renderFloorSelect()}
							</select>
						</span>
					</div>
					<div className="control-div fixed-width active" onClick={this._scaleDown}>
						<span className="control-content">
							<i className="ion-ios-minus-outline"></i><div>{Locale.words.scaleDown}</div>
						</span>
					</div>
					<div className="control-div fixed-width active" onClick={this._scaleUp}>
						<span className="control-content">
							<i className="ion-ios-plus-outline"></i><div>{Locale.words.scaleUp}</div>
						</span>
					</div>
				</div>
			</div>
		</div>;
	}
});