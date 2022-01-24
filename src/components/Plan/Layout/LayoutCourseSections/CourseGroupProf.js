import React , { useState , useEffect , useMemo , useReducer } from 'react';
import CourseGroupSection from './CourseGroupSection';

const NumbersReducer = (state,action) => {
	const section_index = action[0];
	const section_new_state = action[1];
	const section_old_state = state.states[section_index];
	if(section_new_state===section_old_state) return state;
	else{
		let newstate = {states:state.states.map(s=>s),full:state.full,force:state.force,box:state.box};
		newstate.states[section_index] = section_new_state;
		newstate[section_old_state]--;
		newstate[section_new_state]++;
		return newstate;
	}
};

const CourseGroupProf = (props) => {
	const [ Toggled , setToggled ] = useState(false);
	const [ Numbers , DispatchStateAction ] = useReducer( NumbersReducer , {
		states : props.content[1].rest.map(s=>'box'),
		full : 0 ,
		force : 0,
		box : props.content[1].rest.length
	});
	useEffect(()=>{
		setToggled(props.toggled);
	},[props.toggled]);
	useEffect(()=>{
		props.dispatchAvailableChange([props.index,[Numbers.full,Numbers.force,Numbers.box]]);
	},[Numbers]);
	return(
	<li>
		<div className="course-group-prof-header" >
			<button className={Toggled ? "button-toggle-under clicked" : "button-toggle-under" } 
					onClick={()=>{ setToggled(prev=>!prev); }}>
				<span className={Toggled ? "caret clicked" : "caret"} >{String.fromCodePoint(9701)}</span>
				<span>{props.content[0]}</span>
			</button>
			{props.showUnder ?
				(Numbers.box>0 ? <span style={{color:'green',marginRight:'5px',fontWeight:'500',whiteSpace:'nowrap'}}>{Numbers.box+' avail.'}</span> :
				<div style={{display:'flex',color:'red',fontWeight:'500',whiteSpace:'nowrap'}}>
					{Numbers.full>0 ? <span style={{marginRight:'5px',whiteSpace:'nowrap'}}>{Numbers.full+' full'}</span> : null}
					{Numbers.force>0 ? <span style={{marginRight:'5px',whiteSpace:'nowrap'}}>{Numbers.force+' force'}</span> : null}
				</div>)
			: null}
		</div>
		<table className={Toggled ? "sections_table" : "sections_table nodisplay"} ><tbody>
		{useMemo(()=>
			props.content[1].rest.map((section,k)=>
				<CourseGroupSection
					dispatchStateChange={DispatchStateAction}
					index={k}
					section={section}
					sectionShowProps={props.sectionShowProps}
					groupid={props.groupid}
					showUnder={props.showUnder}
				/>
			)
		,[props.showUnder])}
		</tbody></table>
	</li>);
};

export default CourseGroupProf;