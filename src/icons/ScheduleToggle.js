import React from 'react';
import './ScheduleToggle.css';
import { useSelector , useDispatch } from 'react-redux';
import { ScheduleActiveActions } from '../store/index';

const ScheduleToggle = () => {
	const ScheduleActive = useSelector((state)=>state.ScheduleActive);
	const dispatch = useDispatch();
	return(
		<button onClick={()=>{dispatch(ScheduleActiveActions.toggle());}} className={ScheduleActive ? "schedule-toggle on" : "schedule-toggle off"}><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" data-name="20x20/On Light/Schedule-Alert"><rect stroke="null" x="1.76708" y="4.28703" width="21.53659" height="19.26412" id="rectangle" rx="2"></rect><path stroke="null" id="outline" d="m19.66652,24.99981l-15.99988,0a3.67064,3.67064 0 0 1 -3.66664,-3.66664l0,-13.33323a3.67197,3.67197 0 0 1 3.33331,-3.65064l0,-1.68265a0.99999,0.99999 0 1 1 1.99998,0l0,1.66665l7.67327,0c0,0.10267 -0.008,0.21467 -0.008,0.33333a7.34528,7.34528 0 0 0 0.192,1.66665l-9.52393,0a1.66932,1.66932 0 0 0 -1.66665,1.66665l0,2.33332l13.68256,0a7.33328,7.33328 0 0 0 4.65063,1.66665a7.26128,7.26128 0 0 0 2.99998,-0.64133l0,9.97459a3.67064,3.67064 0 0 1 -3.66664,3.66664zm-17.66653,-12.66657l0,8.99993a1.66932,1.66932 0 0 0 1.66665,1.66665l15.99988,0a1.66932,1.66932 0 0 0 1.66665,-1.66665l0,-8.99993l-19.33318,0zm19.33318,-3.10798l0,0l0,-1.22532a1.66932,1.66932 0 0 0 -1.66665,-1.66665l-3.6933,0a4.63196,4.63196 0 0 1 -0.308,-1.66665c0,-0.11067 0,-0.22266 0.012,-0.33333l2.32265,0l0,-1.66665a0.99999,0.99999 0 0 1 1.99998,0l0,1.68265a3.67064,3.67064 0 0 1 3.33331,3.65064l0,0.23866a4.6733,4.6733 0 0 1 -1.99998,0.98666z"></path><path stroke="null" id="circle" data-name="Shape" d="m19.89569,10.27073a5.10412,5.13537 0 1 1 5.10412,-5.13537a5.10412,5.13537 0 0 1 -5.10412,5.13537z"></path></svg></button>
	);
};

export default ScheduleToggle;