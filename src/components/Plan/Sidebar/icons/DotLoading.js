import React from 'react';
import './DotLoading.css';
const DotLoading = () => {
	return (
		<React.Fragment>
			<span className="dotloading dotloading_first">. </span>
			<span className="dotloading dotloading_second">. </span>
			<span className="dotloading dotloading_third">.</span>
		</React.Fragment>
	);
};

export default DotLoading;