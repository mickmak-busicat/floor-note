"use strict";

var FloorRoom = React.createClass({
	getDefaultProps: function(){
		return {
			'status': 0,
			'label': '',
			'notes': '',
			'index': 0,
			'currentFloor': 0,
		};
	},

	getInitialState: function() {
		return {};
	},

	componentDidMount: function(){
		var _this = this;

		$(this.refs.roomBody).hammer().bind("press", function(ev) {
			var screenBlock = $('<div>').addClass('screen-block');

			screenBlock.bind('mouseup', function(e){
				$('.screen-block').remove();
			});

			$('body').append(screenBlock);
			$(_this.refs.roomBody).addClass('active');
			_this.props._pOpenModal(_this.props.id);
		});

		$(this.refs.roomBody).bind("mouseup", function(e){
			setTimeout(function(){
				$('.screen-block').remove();
			}, 250);
		});

		$(this.refs.roomBody).bind('touchend', function(e){
			setTimeout(function(){
				$('.screen-block').remove();
			}, 250);
		});

		if(this.props._pIsResourceReady()){
			this._displayIcon(this.props._pGetRoomIcon(this.props.status));
		}else{
			this.props._pAddImageLoaderHook("preloadIcon", this._imageLoaderHook);
		}
	},

	componentWillReceiveProps: function(nextProps) {
		if(this.props.currentFloor !== nextProps.currentFloor){
			this._displayIcon(this.props._pGetRoomIcon(nextProps.status));
		}
	},

	_imageLoaderHook: function(){
		// console.log('hook invoked! object:');
		// console.log(this.props);
		this._displayIcon(this.props._pGetRoomIcon(this.props.status));
	},

	_nextStatus: function(){
		var icon = this.props._pNextRoomStatus(this.props.id, this.props.status);
		this._displayIcon(icon);
	},

	_displayIcon: function(icon){
		var canvas = this.refs.iconDisplay;
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		if(icon !== null){
			var x = canvas.width/2 - icon.width/2;
			var y = canvas.height/2 - icon.height/2;
			context.drawImage(icon, x, y );
		}
	},

	render: function(){
		return <div ref="roomBody" className='room-object room' style={{'left': this.props.x+'px','top':this.props.y+'px',}} onClick={this._nextStatus}>
			<canvas status={this.props.status} className="status-display-cavnas" ref="iconDisplay" width="100" height="100"></canvas>
			<p className='notes' hidden={this.props.label==''||this.props.label==undefined}>{this.props.label}</p>
			<span className="room-mark">
				<span hidden={this.props.notes===""}><i className="ion-ios-compose text-success"></i></span>
			</span>
		</div>;
	}
});