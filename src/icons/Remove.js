import React from 'react';
import './Remove.css';

const choices = [
<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path stroke="null" d="m9.99984,8.41153l-3.46453,-3.42036l3.41661,-3.45078l-1.54039,-1.54039l-3.42161,3.46578l-3.46244,-3.41786l-1.52748,1.52748l3.46703,3.43328l-3.41911,3.46369l1.52748,1.52748l3.43203,-3.46578l3.45203,3.41786l1.54039,-1.54039z"/></svg>
,
<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" clip-rule="evenodd" fill-rule="evenodd"><path stroke="null" d="m7.5,7.01796l7.01796,-7.01796l0.48205,0.48205l-7.01796,7.01796l7.01796,7.01796l-0.48205,0.48205l-7.01796,-7.01796l-7.01796,7.01796l-0.48205,-0.48205l7.01796,-7.01796l-7.01796,-7.01796l0.48205,-0.48205l7.01796,7.01796z"/></svg>
];

const Remove = (props) => {
	return (
		<button className={"remove-button-"+props.choice} onClick={props.onClick}>
			{choices[props.choice-1]}
		</button>
	);
};

export default Remove;