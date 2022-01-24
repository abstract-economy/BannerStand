import React from 'react';
import { ScheduleActiveActions , ScheduleMasterActions } from '../../store/index';
import { useSelector , useDispatch } from 'react-redux';
import './ScheduleNav.css';
import ScheduleToggle from 'icons/ScheduleToggle';

const ScheduleNav = (props) => {
	const ScheduleActive = useSelector((state)=>state.ScheduleActive);
	const ScheduleFullMode = useSelector((state)=>state.ScheduleMaster.nofullmode);
	const dispatch = useDispatch();
	return(<div id="schedule-nav">
		<ScheduleToggle onClickHandler={()=>{dispatch(ScheduleActiveActions.toggle());}}
		classNm={ScheduleActive ? "schedule-toggle on" : "schedule-toggle off"} />
		{ScheduleActive ? <button onClick={()=>{dispatch(ScheduleMasterActions.toggle_nofullmode());}} className={ScheduleFullMode ? "schedule-nofullmode on" : "schedule-nofullmode off"}><span><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path stroke="null" d="m9.99984,8.41153l-3.46453,-3.42036l3.41661,-3.45078l-1.54039,-1.54039l-3.42161,3.46578l-3.46244,-3.41786l-1.52748,1.52748l3.46703,3.43328l-3.41911,3.46369l1.52748,1.52748l3.43203,-3.46578l3.45203,3.41786l1.54039,-1.54039z"></path></svg></span><span>Full sections</span></button> : null}
	</div>);
};

export default React.memo(ScheduleNav);