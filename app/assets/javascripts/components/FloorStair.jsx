var FloorStair = React.createClass({
	getDefaultProps: function(){
		return {
			
		};
	},

	getInitialState: function() {
		return {
		};
	},

	componentDidMount: function(){
		var _this = this;
	},

	_getStyle: function(){
		return 'room-object stair '+this.props.direction;
	},

	render: function(){
		return <div className={this._getStyle()} style={{'left': this.props.x+'px', 'top':this.props.y+'px'}}></div>;
	}
});