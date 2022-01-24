import React from 'react';
import './Loading.css';

const Loading = (props) => {
	let clss = 'lds-dual-ring';
	if(!props.loading) clss = 'lds-dual-ring invisible';
	return (<div className={clss}></div>);
}

export default Loading;