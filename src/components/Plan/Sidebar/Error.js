import React from 'react';
import './Error.css';
import Remove from 'icons/Remove';

const Error = (props) => {
	return (
		<div className='warning' style={{transition:props.collapsed ? 'top 0.5s' : 'top 0.5s 0.25s',top: props.collapsed ? '30px' : '0px'}}>
		   <div className="warning_msgs" >{props.error_msgs.map(msg=>{ return <span>{msg}</span>; })}</div>
		   <Remove choice={2} onClick={()=>{props.set({error_msgs:[]});}} />
		</div>
	);
};

export default React.memo(Error);