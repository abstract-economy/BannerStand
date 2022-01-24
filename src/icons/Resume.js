import React from 'react';
import './Resume.css';

const Resume = (props) => {
	return (
		<button class="resume-button" onClick={props.onClick} >
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path stroke="null" d="m9,1.5c4.1355,0 7.5,3.3645 7.5,7.5s-3.3645,7.5 -7.5,7.5s-7.5,-3.3645 -7.5,-7.5s3.3645,-7.5 7.5,-7.5zm0,-1.5c-4.97025,0 -9,4.02975 -9,9s4.02975,9 9,9s9,-4.02975 9,-9s-4.02975,-9 -9,-9zm-2.25,12.75l0,-7.5l6.75,3.8595l-6.75,3.6405z"/></svg>
		</button>
	);
};

export default Resume;