var FloorWalkable = React.createClass({
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

	render: function(){
		return <div className='room-object walkable' style={{'left': (this.props.x*this.props._pGetScale())+'px', 'top':(this.props.y*this.props._pGetScale())+'px', 'width': (this.props.width*this.props._pGetScale())+'px', 'height': (this.props.height*this.props._pGetScale())+'px'}}></div>;
	}
});