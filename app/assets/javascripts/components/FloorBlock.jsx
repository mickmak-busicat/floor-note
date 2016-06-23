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
		return <div className='room-object block' style={{'left': (this.props.x*this.props._pGetScale())+'px', 'top':(this.props.y*this.props._pGetScale())+'px', 'width': Math.ceil(this.props.width*this.props._pGetScale())+'px', 'height': Math.ceil(this.props.height*this.props._pGetScale())+'px'}}></div>;
	}
});