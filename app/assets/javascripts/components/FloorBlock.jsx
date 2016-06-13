"use strict";

var FloorBlock = React.createClass({
	getDefaultProps: function(){
		return {
			
		};
	},

	componentDidMount: function(){
		var _this = this;
	},

	render: function(){
		return <div className='room-object block' style={{'left': this.props.x+'px', 'top':this.props.y+'px', 'width': this.props.width+'px', 'height': this.props.height+'px'}}></div>;
	}
});