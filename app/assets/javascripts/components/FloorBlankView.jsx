"use strict";

var FloorBlankView = React.createClass({

	mixins: [InputMixin, FloorViewMixin],

	getDefaultProps: function(){
		return {
			'blankModeStoreKey': '_b',
			'columnSize': 4,
			'floorLimit': 50,
			'mode': 'BLANK',
		};
	},

	getInitialState: function() {
		return {
			'floors': {},
			'floorViewIndex': 0,
			'modalLabel': '',
			'modalNotes': '',
			'modalFloorLabel': '',
			'currentModalRoom': 0,
		};
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		this._saveSession(nextState);

		return true;
	},

	componentDidUpdate: function(prevProps, prevState){
		this._adjustControlWidth();
		$('#appUseSpan').find('.floor-name').html(this._getFloorLabel());
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

		$('#appUseSpan').append($('<span>').addClass('header-action').append($('<span>').addClass('floor-name small').html('')).append($('<span>').addClass('floor-name-edit').append($('<i>').addClass('ion-edit'))));
		$('#appUseSpan').find('.header-action').click(function(e){
			$(_this.refs.editNameModal).modal('show');

			// GA #40
			ga('send', 'event', 'Blank Mode', 'Floor name clicked');

			_this.setState({'modalFloorLabel': _this._getFloorLabel()});
		});
	},

	_constructSession: function(){
		var numberOfRooms = parseInt(this.props.rm);
		var floors = {};
		var currentFloor = {};
		var floorViewIndex = 1;
		var previousSession = localStorage.getItem(this.props.blankModeStoreKey);

		if(previousSession === "" || previousSession === null){
			currentFloor = this._createFloor(floorViewIndex);

			for(var i=0; i<numberOfRooms; i++){
				currentFloor.objects[i] = this._createRoom(i);
			}

			floors[1] = currentFloor;
		}else{
			previousSession = JSON.parse(previousSession);
			floors = previousSession.floors;
			floorViewIndex = previousSession.floorViewIndex;
		}

		$(this.refs.containerBody).css('height', ($(window.top).height()-126)+'px');
		this._adjustControlWidth();
		this._constructCachedImage();

		$('body').addClass("primary-color");
		this.setState({'floors': floors, 'floorViewIndex': floorViewIndex});
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

	/**
	 *
	 * Show popup operation for a room.
	 * @param {Integer} roomId
	 *
	 */

	_popForRoom: function(roomIndex){
		$('#roomRates').modal('show');
		var room = this._findFloorObjects(this.state.floorViewIndex, roomIndex);

		// GA #39
		ga('send', 'event', 'Blank Mode', 'Room detail popup opened');

		var state = {
			'currentModalRoom': roomIndex,
			'modalNotes': room.notes===undefined?'':room.notes,
			'modalLabel': room.label
		};

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

	_saveSession: function(rawObject){
		var state = JSON.stringify(rawObject);
			// state = JSON.stringify(this.state);

		localStorage.setItem(this.props.blankModeStoreKey, state);
	},

	_createFloor: function(index){
		var newFloor = {
			index: index,
			label: index+'/F',
			objects: {},
		};

		return newFloor;
	},

	_createRoom: function(index){
		var roomObject = {};
		var xOffset = 20;
		var yOffset = 20;
		var xMargin = 50;
		var yMargin = 50;
		var size = 100;
		var eng = index.intToAlphabet();

		var xi = index%this.props.columnSize;
		var yi = parseInt(index/this.props.columnSize);

		roomObject = {
			type: 'room',
			label: (index+1)+'/'+eng,
			notes: '',
			x: xOffset+(xi*size)+(xi*xMargin),
			y: yOffset+(yi*size)+(yi*yMargin),
			status: 0,
			index: index
		};

		return roomObject;
	},

	_nextRoomStatus: function(roomIndex, currentStatus){
		var currentIndex = ((currentStatus + 1)==this.props.defaultIconSet.length)?0:(currentStatus+1);
		this._updateRoomData(this.state.floorViewIndex, roomIndex, 'status', currentIndex);

		// GA #38
		ga('send', 'event', 'Blank Mode', 'Change room state');
	
		return this._getStatusIcon(currentIndex);
	},

	_updateModalLabel: function(e){
		this.setState({'modalLabel': e.target.value});
	},

	_updateRoomLabel: function(e){
		Materialize.toast(Locale.words.labelUpdate, 2000);
		// GA #45
		ga('send', 'event', 'Blank Mode', 'Room label updated');

		this._updateRoomData(this.state.floorViewIndex, this.state.currentModalRoom, 'label', e.target.value);
	},

	_updateModalNotes: function(e){
		this.setState({'modalNotes': e.target.value});
	},

	_updateRoomNotes: function(e){
		Materialize.toast(Locale.words.noteUpdate, 2000);
		// GA #46
		ga('send', 'event', 'Blank Mode', 'Room notes updated');

		this._updateRoomData(this.state.floorViewIndex, this.state.currentModalRoom, 'notes', e.target.value);
	},

	_getBackgroundImage: function(roomIndex){
		var iconDisplay = this.props.defaultIconSet[this._findFloorObjects(this.state.floorViewIndex, roomIndex).status];
		if(iconDisplay === ""){
			return "";
		}
		return iconDisplay;
	},

	_updateRoomData: function(floorIndex, roomIndex, key, value){
		var floors = $.extend(true, {}, this.state.floors);
		floors[floorIndex].objects[roomIndex][key] = value;
		this.setState({'floors': floors});
	},

	_addRoom: function(){
		var floors = $.extend(true, {}, this.state.floors);
		var rooms = floors[this.state.floorViewIndex].objects;
		var nextIndex = (Object.keys(rooms).length==0)?0:Math.max.apply(null, Object.keys(rooms)) + 1;
		rooms[nextIndex] = this._createRoom(nextIndex);

		// GA #47
		ga('send', 'event', 'Blank Mode', 'Add room clicked');

		Materialize.toast(Locale.words.addedRoom.replace('`NAME`', rooms[nextIndex].label), 2000);
		this.setState({'floors': floors});
	},

	_addFloor: function(){
		var floors = $.extend(true, {}, this.state.floors);
		var nextIndex = Math.max.apply(null, Object.keys(floors)) + 1;
		var numberOfRooms = parseInt(this.props.rm) || 0;
		var newFloor = this._createFloor(nextIndex);

		// GA #48
		ga('send', 'event', 'Blank Mode', 'Add Floor clicked');

		for(var i=0; i<numberOfRooms; i++){
			newFloor.objects[i] = this._createRoom(i);
		}

		floors[nextIndex] = newFloor;

		Materialize.toast(Locale.words.addedFloor.replace('`NAME`', newFloor.label), 3000);

		if(numberOfRooms == 0){
			Materialize.toast(Locale.words.noRoomInThisFloor, 10000);
		}

		this.setState({'floors': floors, 'floorViewIndex': nextIndex});
	},

	_getFloorCount: function(){
		if(this.state.floors[this.state.floorViewIndex] === undefined){
			return 0;
		}
		return Object.keys(this.state.floors[this.state.floorViewIndex]).length;
	},

	_getRoomCount: function(){
		if(this.state.floors[this.state.floorViewIndex] === undefined){
			return 0;
		}
		return Object.keys(this.state.floors[this.state.floorViewIndex].objects).length;
	},

	_switchFloor: function(e){
		// GA #44
		ga('send', 'event', 'Blank Mode', 'Go to floor used', ""+e.target.value);

		this._goToFloor(e.target.value);
	},

	_goToFloor: function(floorIndex){
		Materialize.toast(Locale.words.onFloor.replace('`NAME`', this.state.floors[floorIndex].label), 2000);
		this.setState({'floorViewIndex': floorIndex});
	},

	_goUpFloor: function(){
		var targetFloor = -1;
		var currentFloor = this.state.floorViewIndex;

		// GA #42
		ga('send', 'event', 'Blank Mode', 'Go up floor clicked');

		$.each(this.state.floors, function(index, floor){
			if(floor.index > currentFloor){
				if(targetFloor > floor.index || targetFloor == -1){
					targetFloor = floor.index;
				}
			}
		});

		if(targetFloor == -1){
			Materialize.toast(Locale.words.cannotGoUp, 2000);
		}else{
			this._goToFloor(targetFloor);
		}
	},

	_goDownFloor: function(){
		var targetFloor = -1;
		var currentFloor = this.state.floorViewIndex;

		// GA #43
		ga('send', 'event', 'Blank Mode', 'Go down floor clicked');

		$.each(this.state.floors, function(index, floor){
			if(floor.index < currentFloor){
				if(targetFloor < floor.index || targetFloor == -1){
					targetFloor = floor.index;
				}
			}
		});

		if(targetFloor == -1){
			Materialize.toast(Locale.words.cannotGoDown, 2000);
		}else{
			this._goToFloor(targetFloor);
		}
	},

	_findFloorObjects: function(floorIndex, roomIndex){
		var result = [];

		if(this.state.floors[floorIndex] === undefined){
			return result;
		}

		result = this.state.floors[floorIndex].objects;

		if(roomIndex !== undefined){
			return result[roomIndex];
		}

		return result;
	},

	_getFloorLabel: function(){
		var result = 'No name';
		var currentFloor = this.state.floors[this.state.floorViewIndex];

		if(currentFloor !== undefined){
			result = currentFloor.label;
		}

		return result;
	},

	_getScale: function(){
		return 1;
	},

	_updateFloorModalLabel: function(e){
		// GA #41
		ga('send', 'event', 'Blank Mode', 'Floor label updated');

		this.setState({'modalFloorLabel': e.target.value});
	},

	_updateFloorLabel: function(e){
		Materialize.toast(Locale.words.floorLabelUpdate, 2000);
		this._updateFloorData(this.state.floorViewIndex, 'label', e.target.value);
	},

	_updateFloorData: function(floorIndex, key, value){
		var floors = $.extend(true, {}, this.state.floors);
		floors[floorIndex][key] = value;
		this.setState({'floors': floors});
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

	_isResourceReady: function(){
		return this.cachedImage.loadDone;
	},


	/**
	 *
	 * Render floor objects
	 * @return {FloorBlankObject[]} resultArray
	 *
	 */
	
	_renderFloor: function(){
		var _this = this;
		var resultArray = [];
		var targetFloorObjects = this._findFloorObjects(this.state.floorViewIndex);

		$.each(targetFloorObjects, function(index, obj){
			if(obj.type == 'room'){
				resultArray.push(<FloorBlankRoom _pGetScale={_this._getScale} _pIsResourceReady={_this._isResourceReady} _pAddImageLoaderHook={_this._addHook} _pOpenModal={_this._popForRoom} _pNextRoomStatus={_this._nextRoomStatus} _pGetRoomIcon={_this._getStatusIcon} _pGetBackgroundImage={_this._getBackgroundImage} key={index} id={index} x={obj.x} y={obj.y} label={obj.label!==''?obj.label:''} status={obj.status} index={obj.index} notes={obj.notes} currentFloor={_this.state.floorViewIndex} />);
			}else {
				console.log('Unknown object type: '+ obj.type);
			}
		});

		return resultArray;
	},

	_renderFloorSelect: function(){
		var _this = this;
		var result = [];

		$.each(this.state.floors, function(index, floor){
			result.unshift(<option key={floor.index} value={floor.index} disabled={_this.state.floorViewIndex==floor.index}>{floor.label}</option>);
		});

		return result;
	},


	render: function(){
		var listEl = [];
		return <div>
			<div className="opacity-modal modal fade" ref="editNameModal" tabindex="-1" role="dialog">
			  <div className="modal-content">
				  <div className="modal-body controls">
				  	<div>{Locale.words.floorLabel}</div>
				  	<input type="text" maxLength="15" value={this.state.modalFloorLabel} onKeyPress={this._enterToBlur} onChange={this._updateFloorModalLabel} onBlur={this._updateFloorLabel} />
				  </div>
				  <div className="modal-footer">
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" data-dismiss="modal">{Locale.words.close}</button>
				  </div>
			  </div>
			</div>
			<div className="opacity-modal modal fade" id="roomRates" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
			  <div className="modal-content">
				  <div className="modal-header controls">
				    <h4 className="modal-title" id="myModalLabel">{Locale.words.modalTitle}</h4>
				  </div>
				  <div className="modal-body controls">
				  	<div>{Locale.words.modalLabel}</div>
				  	<input type="text" maxLength="10" value={this.state.modalLabel} onChange={this._updateModalLabel} onKeyPress={this._enterToBlur} onBlur={this._updateRoomLabel} />
				  	<div>{Locale.words.modalNote}</div>
				  	<div className="input-field animated">
						<i className="ion-ios-compose-outline prefix"></i>
						<textarea className="materialize-textarea" maxLength="255" value={this.state.modalNotes} onChange={this._updateModalNotes} onBlur={this._updateRoomNotes} ></textarea>
					</div>
				  </div>
				  <div className="modal-footer">
				    <button type="button" className="btn btn-lg col-md-12 col-xs-12 col-sm-12 waves-effect waves-green" data-dismiss="modal">{Locale.words.close}</button>
				  </div>
			  </div>
			</div>
			<div className="floor-container" ref="containerBody">
				{this._renderFloor()}
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
					<div className={"control-div fixed-width " + ((this._getFloorCount()>=this.props.floorLimit)?'':'active')} onClick={this._addFloor}>
						<span className="control-content">
							<div><i className="ion-plus-circled"></i></div>{Locale.words.addFloor}
						</span>
					</div>
					<div className="control-div fixed-width active" onClick={this._addRoom}>
						<span className="control-content">
							<div><i className="ion-plus-circled"></i></div>{Locale.words.addRoom}
						</span>
					</div>
				</div>
			</div>
		</div>;
	}
});