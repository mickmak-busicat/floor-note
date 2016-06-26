var FloorElevator = React.createClass({
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

	_objectOutlook: function(){
		var result = {};
		var border = [true, true, true, true]
		var position = ['Top', 'Right', 'Bottom', 'Left'];

		result['left'] = (this.props.x*this.props._pGetScale())+'px';
		result['top'] = (this.props.y*this.props._pGetScale())+'px';
		result['width'] = (this.props.size*this.props._pGetScale())+'px';
		result['height'] = (this.props.size*this.props._pGetScale())+'px';

		if(this.props.direction == 'n'){
			border[0] = false
		}

		if(this.props.direction == 'e'){
			border[1] = false
		}

		if(this.props.direction == 's'){
			border[2] = false
		}

		if(this.props.direction == 'w'){
			border[3] = false
		}

		for(var i=0; i<border.length; i++){
			if(border[i]){
				result['border'+position[i]] = '4px solid #3A2E15';
			}else{
				result['border'+position[i]] = '4px solid #59B0CE';
			}
		}

		return result;
	},

	render: function(){
		return <div className='room-object elevator' style={this._objectOutlook()}></div>;
	}
});