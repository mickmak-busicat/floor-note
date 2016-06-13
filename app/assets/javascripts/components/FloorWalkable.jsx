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
		return <div className='room-object walkable' style={{'left': this.props.x+'px', 'top':this.props.y+'px', 'width': this.props.width+'px', 'height': this.props.height+'px'}}></div>;
	}
});