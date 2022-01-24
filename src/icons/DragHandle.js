import React from 'react';
import './DragHandle.css';

const DragHandle = (props) => {
	return(<button className="drag-handle-button" onMouseDown={props.onMouseDown} >
		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
			<rect width="14" height="14" fill={props.fill?props.fill:"white"}/>
			<rect x="1" y="4" width="12" height="2" rx="1" fill="#787878"/>
			<rect x="1" y="8" width="12" height="2" rx="1" fill="#787878"/>
		</svg>
	</button>);
};

export default DragHandle;