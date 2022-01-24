import React , { useState , useEffect } from 'react';
import SidebarToggle from 'icons/SidebarToggle';
import ScheduleNav from './ScheduleNav';
import Sidebar from './Sidebar/Sidebar';
import Layout from './Layout/Layout';
import Schedule from './Schedule/Schedule';
import send_logs from '../../log_fn';

const Plan = () => {
	const [ NewCourse , setNewCourse ] = useState(null);
	const [ SidebarCollapsed , setSidebarCollapsed ] = useState(false);
	useEffect(()=>{
		send_logs('BannerStand OPENED!');
	},[]);
	return(
	  <div style={{
			display:'flex',
			position: 'relative',
			overflow: 'hidden',
			width: '100vw',
  			height: '100vh'
	  }}>
			<SidebarToggle
				collapsed={SidebarCollapsed}
				set_sidebar_collapsed={setSidebarCollapsed}
			/>
			<ScheduleNav />
			<Sidebar
				collapsed={SidebarCollapsed}
				add_layout_course={setNewCourse}
			/>
			<Layout
				collapsed={SidebarCollapsed}
				new_course={NewCourse}
			/>
			<Schedule />
	  </div>
	);
}

export default Plan;