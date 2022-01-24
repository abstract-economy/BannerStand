import React , { useState } from 'react';
import './CourseNote.css';

const CourseNote = (props) => { // props.one , props.n , props.urgent , props.note
	const [ ExcessToggled , setExcessToggle ] = useState(false);
	if(props.one)
		return(
			<tr className={props.urgent ? 'urgent' : ''} >
				<td>{`All`+String.fromCharCode(160)+`sections (${props.n})`}</td>
				<td>{props.note}</td>
			</tr>
		);
	else{
		let sections;
		let excess=false;
		if(props.note.secNums.length>5){
				sections = 'Sections ' + props.note.secNums.slice(0,5).join(' , ');
				excess = ' , ' + props.note.secNums.slice(5).join(' , ');
		}
		else if(props.note.secNums.length===1) sections = 'Section ' + props.note.secNums[0];
		else sections = 'Sections '+ props.note.secNums.join(' , ');
		return(
			<tr className={props.urgent ? 'urgent' : ''} >
				<td>
					{sections}
					{excess ?
					<React.Fragment>
					  <span style={{display:(ExcessToggled ? "initial" : "none")}} >{excess}</span>
					  <button className="button-excess-sections" onClick={()=>{ setExcessToggle(prev=> !prev); }}>
						{ExcessToggled ? "...less" : "more..."}
					  </button>
					</React.Fragment>
					: null}
				</td>
				<td><div style={{display:'flex',flexDirection:'column'}} >
					{props.note.active!==undefined ? <span>{props.note.active}</span> : null}
					{props.note.startEnd!==undefined ?
					<span style={{display:'flex'}}>Start/end<span
						style={{display:'flex',flexDirection:'column',margin:'0 0 0 5px'}}>{props.note.startEnd.map(d=><span>{d}</span>)}</span></span>
					: null}
					{props.note.campus!==undefined ? <span>{props.note.campus}</span> : null}
					{props.note.main!==undefined ? <span>{props.note.main ? props.note.main : 'No notes'}</span> : null}
				</div></td>
			</tr>
		);
	}
};

export default CourseNote;