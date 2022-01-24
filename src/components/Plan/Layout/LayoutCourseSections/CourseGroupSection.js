import React , { useMemo , useState , useEffect , useCallback } from 'react';
import { useSelector , useDispatch } from 'react-redux';
import { ScheduleMasterActions } from '../../../../store/index';
import './CourseGroupSection.css';

const CourseGroupSection = (props) => {
	const dispatch = useDispatch();
	const section = useMemo(()=>props.section,[]);
	const subgroupid = useMemo(()=>props.groupid+section.subgroup_loc,[]);
	const no_full = useSelector(state=>state.ScheduleMaster.nofullmode);
	const subgroup = useSelector(state=>state.ScheduleMaster.subgroups[subgroupid]);
	const TickChangeHandler = useCallback((e) => {
		if(e.target.checked){
			dispatch(ScheduleMasterActions.addSubgroup([section,subgroupid]));
		}
		else{
			dispatch(ScheduleMasterActions.removeSubgroup(subgroupid));
		}
	},[]);
	const icon = useMemo(() => {
		if(no_full && section.full){
			return ['full',<td style={{margin:'0',verticalAlign:'middle',padding:'0',visibility:"hidden"}}>
			<input type="checkbox" checked={subgroup&&subgroup.checked} onChange={TickChangeHandler} /></td>];
		}
		else if(subgroup&&subgroup.force.length){
			return ['force',<td style={{margin:'0',verticalAlign:'middle',padding:'0',visibility:"visible"}}>
			<span className="force-section-container" onClick={()=>{dispatch(ScheduleMasterActions.addSubgroup([section,subgroupid]));}}>
				<button className="force-section-button">Force</button>
				<div className="force-section-modal">
					<span>Will clear the selected section in these courses:</span>
					<div style={{marginTop:'5px',display:'flex',flexDirection:'column'}}>{subgroup.force.map(g=><span>{'- '+g.id}</span>)}</div>
				</div>
			</span></td>];
		}
		else{
			return ['box',<td style={{margin:'0',verticalAlign:'middle',padding:'0',visibility:"visible"}}>
			<input type="checkbox" checked={subgroup&&subgroup.checked} onChange={TickChangeHandler} /></td>];
		}
	},[no_full,subgroup]);
	useEffect(()=>{
		props.dispatchStateChange([props.index,icon[0]]);
	},[icon[0]]);
	const bodyOnce = useMemo(()=>{
		return section.parts[0].dhl.map((p,i)=>
			<React.Fragment>
						<td>{p.days}</td>
						<td>{p.hours}</td>
						{i===0 ?
						<React.Fragment>
							<td style={{color:(section.full ? "#d10f0f" : "inherit")}}>{section.main}</td>
							<td><span className="section_tooltip_container" ><div className="section_tooltip">
								<div className="section_info">
									{props.sectionShowProps[0] ? <span>{section.active}</span> : null}
									<span>CRN : {section.crn}</span>
									<span>WaitList : {section.waitList}</span>
									<span className="section_rooms">{section.parts[0].dhl.length>1 ? "Rooms :" : "Room :"}<div>
										{section.parts[0].dhl.map(p=><span>{p.locations}</span>)}
									</div></span>
									{props.sectionShowProps[1] ?
										<span className="section_startend">Start/end :<div>
											{section.parts[0].dhl.map(p=><span>{p.startEnd}</span>)}
										</div></span>
									: null}
									{props.sectionShowProps[2] ? <span>{section.campus}</span> : null}
									{section.parts.length>1 ?
									<span className="section_rooms">{section.parts[1].dhl.length>1 ? "Exam Rooms :" : "Exam Room :"}<div>	
										{section.parts[1].dhl.map(p=><span>{p.locations}</span>)}
									</div></span>
									: null}
								</div>
								<div className="section_note" style={{width:(section.note ? '17em' : '5em')}}
								>{section.note ? section.note : 'No notes'}</div>
							</div></span></td>
						</React.Fragment>
						: <td colSpan='2'></td>}
			</React.Fragment>
		);
	},[]);
	const additionalOnce = useMemo(()=>{
		if(section.parts.length>1)
			return (<React.Fragment>
					<td>{section.parts[1].type}</td>
					{section.parts[1].dhl.map(p=>
						<React.Fragment>
							<td>{p.days}</td>
							<td>{p.hours}</td>
							<td colSpan='2'>{p.startEnd}</td>
						</React.Fragment>
					)}
				</React.Fragment>);
		else return null;

	},[]);
	return(<tr><td><table className="section"><tbody>
			{useMemo(()=>
				section.parts[0].dhl.map((p,i)=>
					<tr>
						{i===0 ?
						<React.Fragment>
							{props.showUnder ? icon[1] : null}
							<td>Sec {section.secNum}</td>
						</React.Fragment>
						: <td colSpan={props.showUnder ? '2' : '1'} ></td>}
						{bodyOnce[i]}
					</tr>
				)
			,[props.showUnder,icon[1]])}
			{section.parts.length>1 ?
				<tr>
					{props.showUnder ? <td></td> : null}
					{additionalOnce}
				</tr>
			: null}
		</tbody></table></td></tr>);
};

export default CourseGroupSection;