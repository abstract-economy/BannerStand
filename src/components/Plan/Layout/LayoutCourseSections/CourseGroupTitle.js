import React , { useState , useEffect , useMemo , useCallback , useReducer } from 'react';
import CourseGroupProf from './CourseGroupProf';

const NumbersReducer = (state,action) => {
	const profindex = action[0];
	const profnumbers = action[1];
	let newstate = {arr:state.arr.map(s=>s),totals:[0,0,0]};
	newstate.arr[profindex] = profnumbers;
	newstate.arr.forEach(p=>{ //full,force,box
		newstate.totals[0]+=p[0];
		newstate.totals[1]+=p[1];
		newstate.totals[2]+=p[2];
	});
	return newstate;
};

const CourseGroupTitle = (props) => {
	const professors = useMemo(()=>Object.keys(props.content[1].rest),[]);
	const [ Toggled , setToggled ] = useState(false);
	const [ Numbers , DispatchAvailableChange ] = useReducer(NumbersReducer,{arr:professors.map(p=>[0,0,0]),totals:[0,0,0]});
	const titleprofs = useMemo(()=>{
		return professors.map((prof,i)=>
			<CourseGroupProf
				index={i}
				toggled={props.toggled}
				content={[prof,props.content[1].rest[prof]]}
				sectionShowProps={props.sectionShowProps}
				groupid={props.groupid}
				showUnder={props.showUnder}
				dispatchAvailableChange={DispatchAvailableChange}
			/>
		);
	},[props.toggled,props.showUnder]);
	useEffect(()=>{
		setToggled(props.toggled);
	},[props.toggled]);
	return(
		<li>
			<div className="course-group-title-header">
				<button className={Toggled ? "button-toggle-under clicked" : "button-toggle-under" }
						onClick={()=>{ setToggled(prev=>!prev); }}>
					<span className={Toggled ? "caret clicked" : "caret"} >{String.fromCodePoint(9701)}</span>
					<span>{props.content[0]}</span>
				</button>
				{props.showUnder ?
				(Numbers.totals[2]>0 ?
				<span style={{color:'green',marginRight:'5px',fontWeight:'500',whiteSpace:'nowrap'}}>{Numbers.totals[2]+' avail.'}</span> :
				<div style={{display:'flex',color:'red',fontWeight:'500',whiteSpace:'nowrap'}}>
					{Numbers.totals[0]>0 ? <span style={{marginRight:'5px',whiteSpace:'nowrap'}}>{Numbers.totals[0]+' full'}</span> : null}
					{Numbers.totals[1]>0 ? <span style={{marginRight:'5px',whiteSpace:'nowrap'}}>{Numbers.totals[1]+' force'}</span> : null}
				</div>)
				: null}
			</div>
			<ul className={Toggled ? "title_profs" : "title_profs nodisplay"} >{titleprofs}</ul>
		</li>
	);
};

export default CourseGroupTitle;