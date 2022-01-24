import React , { useState , useMemo , useEffect , useCallback } from 'react';
import { useSelector , useDispatch } from 'react-redux';
import { ScheduleMasterActions } from '../../../../store/index';
import './CourseGroup.css';
import CourseGroupTitle from './CourseGroupTitle';
import CourseGroupProf from './CourseGroupProf';

const processTitles = (childrenProps,sectionShowProps,toggled,groupid,showUnder) => {
	let titles = new Array(childrenProps.length);
	for(let i=0;i<titles.length;i++){
		titles[i] = <CourseGroupTitle
				index={i}
				toggled={toggled}
				content={childrenProps[i]}
				sectionShowProps={sectionShowProps}
				groupid={groupid}
				showUnder={showUnder}
		/>
	}
	return titles;
};

const processProfs = (childrenProps,sectionShowProps,toggled,groupid,showUnder) => {
	let profs = new Array(childrenProps.length);
	for(let i=0;i<profs.length;i++){
		profs[i] = <CourseGroupProf
				index={i}
				toggled={toggled}
				groupid={groupid}
				content={childrenProps[i]}
				sectionShowProps={sectionShowProps}
				showUnder={showUnder}
				dispatchAvailableChange={(arg1,arg2)=>{}}
		/>
	}
	return profs;
};

const processTitleLabel = (section) => {
	return(<React.Fragment>
		<span><span>{section.title}</span></span>
		<span style={{marginLeft:'10px'}}>{String.fromCodePoint(10149)+' '+section.profs}</span>
		<span style={{marginLeft:'20px'}}>{String.fromCodePoint(10149)+' Sec '+section.secNum}</span>
	</React.Fragment>);
};

const processProfLabel = (section) => {
	return(<React.Fragment>
			<span><span>{section.profs}</span></span>
			<span style={{marginLeft:'10px'}}>{String.fromCodePoint(10149)+' Sec '+section.secNum}</span>
	</React.Fragment>);
};

const CourseGroup = (props) => {
	const memoized = useMemo(()=>{
		const isProf = Object.keys(props.content[1].rest).length===1;
		if(isProf) return{
			childrenProps: Object.keys(props.content[1].rest[Object.keys(props.content[1].rest)[0]].rest)
					.map(prof=> [prof,props.content[1].rest[Object.keys(props.content[1].rest)[0]].rest[prof]] ),
			processFn: processProfs,
			processSelectionsFn : processProfLabel
		}
		else return{
			childrenProps: Object.keys(props.content[1].rest).map(title=> [title,props.content[1].rest[title]] ),
			processFn: processTitles,
			processSelectionsFn : processTitleLabel
		}
	},[]);
	const [ Toggled , setToggled ] = useState(false);
	const ScheduleActive = useSelector(state=>state.ScheduleActive);
	const ScheduleSemester = useSelector(state=>state.ScheduleMaster.semester);
	const CourseAlreadyExists = !props.alphaSchedule;
	const DifferentSemester = !(ScheduleSemester===null || ScheduleSemester===props.semester[0]);
	const group = useSelector(state=>state.ScheduleMaster.groups[props.groupid]);
	const groupSelected = group?true:false;
	const showUnder = groupSelected&&ScheduleActive&&!DifferentSemester&&!CourseAlreadyExists;
	const dispatch = useDispatch();
	const TickChangeHandler = useCallback((e) => {
		if(e.target.checked){
			dispatch(ScheduleMasterActions.addGroup({
				id: props.groupid,
				name: props.groupname,
				fullname: props.groupfullname,
				creds: props.content[0],
				semester: props.semester,
				process_selected_fn: memoized.processSelectionsFn,
				subgroups: props.content[1].subgroups[1]
			}));
		}
		else{
			dispatch(ScheduleMasterActions.removeGroup(props.groupid));
		}
	},[]);
	useEffect(()=>{
		return (()=>{
			dispatch(ScheduleMasterActions.removeGroup(props.groupid));
		});
	},[]);
	return(
		<li>
			<div className="course_group_title">
			  <input type="checkbox" onChange={TickChangeHandler} className={groupSelected?"add_group_checkbox checked":"add_group_checkbox"}
				style={{display:(ScheduleActive&&!DifferentSemester&&!CourseAlreadyExists)?"initial":"none"}}/>
			  <span className="crhours">{props.content[0]+' cr.'}</span>
			  <button className={Toggled ? "button-toggle-group clicked" : "button-toggle-group"}
				onClick={()=>{ setToggled(prev=>!prev); }}>{String.fromCodePoint(10148)}</button>
			  {ScheduleActive ? DifferentSemester ? <span className="cannot_add_course">Cannot be added. Different semester.</span> :
			  CourseAlreadyExists ? <span className="cannot_add_course">Cannot be added. Course card already exists.</span> : null : null}
			  {useMemo(()=>
				showUnder ?
				(group.selected_section ?
					<div key={Math.random()} className="course_group_selection">{memoized.processSelectionsFn(group.selected_section)}</div>
				: <div key={Math.random()} className="course_group_selection noselection">{'No section selected'}</div>)
			  	: null
			  ,[showUnder,group])}
			</div>
			{useMemo(()=>{
				return(<ul className="course_group">
			  	 {memoized.processFn(memoized.childrenProps,props.sectionShowProps,Toggled,props.groupid,showUnder)}
				</ul>);
			},[Toggled,showUnder])}
		</li>
	);
};

export default CourseGroup;