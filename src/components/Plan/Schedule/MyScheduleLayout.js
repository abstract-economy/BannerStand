import React , { useEffect , useState } from 'react';
import './MyScheduleLayout.css';

let timer = null;

const MyScheduleLayout = (props) => {
	const [ Active , setActive] = useState(false);
	useEffect(()=>{
		if(props.show){
			setActive(true);
			clearTimeout(timer);
			timer = null;
		}
		else{
			clearTimeout(timer);
			timer = null;
			timer = setTimeout(()=>{
				setActive(false);
				clearTimeout(timer);
				timer = null;
			},300);
		}
	},[props.show]);
	const tableRows = Object.keys(props.ScheduleMaster.displayed_schedule).map(day=>
		props.ScheduleMaster.displayed_schedule[day].length>0 ? <tr>
			<td className="day">{day}</td>
			{props.ScheduleMaster.displayed_schedule[day].map(obj=>{
				return <td className="slot"
				style={{backgroundColor:obj.groupid===props.MouseAction[0]?props.MouseAction[1]:'white'}}>
					<span style={{fontStyle:'italic'}}>{props.ScheduleMaster.groups[obj.groupid].fullname}</span>
					<div style={{display:'flex',flexDirection:'column'}}>
						<span style={{fontWeight:'bold'}}>{obj.time_string}</span>
						<div style={{display:'flex',justifyContent:'space-between'}}>
							<span>{'Sec '+props.ScheduleMaster.groups[obj.groupid].selected_section.secNum}</span>
							<span>{props.ScheduleMaster.groups[obj.groupid].selected_section.parts[0].dhl[obj.locations_index].locations}</span>
						</div>
					</div>
				</td>
			})}
		</tr> : null
	);
	const content = tableRows.some(e=>e!==null)?<table>{tableRows}</table>:<div className="tick_needed">Tick beside at least one section.</div>
	return (<div id='my-schedule-layout' onClick={(e)=>{if(e.target.id==='my-schedule-layout')props.show_my_schedule(prev=>!prev);}}
		className={Active ? props.show?'add':'remove' : 'nodisplay'} >{content}</div>);
};

export default MyScheduleLayout;