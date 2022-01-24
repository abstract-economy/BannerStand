import React from 'react';
import './LayoutFiller.css';

const LayoutFiller = (props) => {
	const style_object = {
		top:props.y+'px',
		left:props.x,
		height:props.height+'px',
		width:props.width
	};
	return(<div class="layout_filler" style={style_object}></div>);
};

export default LayoutFiller;