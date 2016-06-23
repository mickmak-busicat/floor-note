var FloorStair = React.createClass({
	getDefaultProps: function(){
		return {
			'size': 100,
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
		return <div className={this._getStyle()} style={{'left': (this.props.x*this.props._pGetScale())+'px', 'top':(this.props.y*this.props._pGetScale())+'px','width':(this.props.size*this.props._pGetScale())+'px','height':(this.props.size*this.props._pGetScale())+'px'}}></div>;
	}
});