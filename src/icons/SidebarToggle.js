import React from 'react';
import './SidebarToggle.css';

const SidebarToggle = (props) => {
	return(<button onClick={()=>{ props.set_sidebar_collapsed(!props.collapsed); }}
		class={props.collapsed ? "sidebar-toggle collapsed" : "sidebar-toggle"} ><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"><path stroke="null" d="m0,12.46875c0,6.92038 5.59687,12.53125 12.5,12.53125s12.5,-5.61087 12.5,-12.53125s-5.59687,-12.53125 -12.5,-12.53125s-12.5,5.61087 -12.5,12.53125zm7.89583,0l6.2375,-6.2604l1.47292,1.47869l-4.76458,4.78172l4.76458,4.7932l-1.47292,1.47869l-6.2375,-6.27189z"></path></svg></button>
	);
};

export default React.memo(SidebarToggle);