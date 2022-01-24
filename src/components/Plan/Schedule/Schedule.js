import React , { useEffect , useState } from 'react';
import MyScheduleLayout from './MyScheduleLayout';
import ScheduleSummary from './ScheduleSummary';
import { useSelector } from 'react-redux';
import send_logs from '../../../log_fn';

const Schedule = () => {
	const [ MySchedule , ShowMySchedule ] = useState(false);
	const [ MouseAction , setMouseAction ] = useState([null,'white']);
	const ScheduleActive = useSelector(state=>state.ScheduleActive);
	const ScheduleMaster = useSelector(state=>state.ScheduleMaster);
	useEffect(()=>{
		const log_msg = ScheduleMaster.last_action===undefined ? 'undefined' : ScheduleMaster.last_action===null ? 'ScheduleMaster initialized' : ScheduleMaster.last_action;
		send_logs(log_msg);
	},[ScheduleMaster]);
	useEffect(()=>{
		const log_msg = ScheduleActive?'turned schedule on':'turned schedule off';
		send_logs(log_msg);
	},[ScheduleActive]);
	useEffect(()=>{
		const log_msg = MySchedule?'Showed my schedule!':'MY schedule off';
		send_logs(log_msg);
	},[MySchedule]);
	return (<React.Fragment>
		<MyScheduleLayout
			show={MySchedule}
			show_my_schedule={ShowMySchedule}
			ScheduleMaster={ScheduleMaster}
			MouseAction={MouseAction}
		/>
		<ScheduleSummary
			schedule_active={ScheduleActive}
			ScheduleMaster={ScheduleMaster}
			show={MySchedule}
			show_my_schedule={ShowMySchedule}
			setMouseAction={setMouseAction}
		/>
	</React.Fragment>);
};

export default Schedule;