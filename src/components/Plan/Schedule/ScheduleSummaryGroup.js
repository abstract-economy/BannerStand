import React , { useState , useEffect , useRef, useMemo , useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ScheduleMasterActions } from '../../../store/index';
import DragHandle from 'icons/DragHandle';

let zIndexTimer = null;

const ScheduleSummaryGroup = (props) => {
	const [ isVisible , setIsVisible ] = useState(false);
	const [ StillDragging , setStillDragging ] = useState(false);
	const [ isDragging , setIsDragging ] = useState(false);
	const [ initMousePos , setInitMousePos ] = useState(0);
	const [ dragCoords , setDragCoords ] = useState(0);
	const [ BC , setBC ] = useState('white');
	const card = useRef();
	const dispatch = useDispatch();
	useEffect(()=>{
		props.dispatch_layout_action(['show',props.index]);
		let fast = false;
		const resizeObserver = new ResizeObserver(entries => {
			props.dispatch_layout_action(['lilbit', props.index , entries[0].borderBoxSize[0].blockSize , entries[0].borderBoxSize[0].inlineSize , fast ]);
			fast=true;
		});
		resizeObserver.observe(card.current);
		setIsVisible(true);
		/*return (()=>{ console.log('removing schedule summary group, sending.....',['remove',props.index,card.current.offsetHeight]);
			props.dispatch_layout_action(['remove',props.index,card.current.offsetHeight]);
			console.log('removing schedule summary group, sent!!!');
		});*/
	},[]);
	useEffect(()=>{
		let scrollingTimer;
		const this_layout_course = card.current;
		const MouseMoveHandler = (event) => {
			if(isDragging){
				const ClientY = event.clientY - this_layout_course.offsetParent.offsetTop;
				const mouseTop = ClientY + this_layout_course.offsetParent.scrollTop;
				props.dispatch_layout_action(['', mouseTop ]);
				let Y_index = 0;
				let yFraction = (this_layout_course.offsetParent.clientHeight - ClientY) / 30; // replace 30 by (this_layout_course.clientHeight  - initMousePos)
				if(yFraction <= 1){
					if(yFraction<0) yFraction = 0;
					Y_index = 1;
				}
				else if(ClientY <= initMousePos) Y_index = 2;
				clearInterval(scrollingTimer);
				setDragCoords(prev=>Y_index ? prev : mouseTop-initMousePos);
				if(Y_index){
					scrollingTimer = setInterval(()=>{
						setDragCoords(prev=>
							[prev.y,this_layout_course.offsetParent.scrollTop+ClientY-initMousePos,this_layout_course.offsetParent.scrollTop][Y_index]
						);
						this_layout_course.offsetParent.scrollTo({
							top: this_layout_course.offsetParent.scrollTop + [0,(1-yFraction)*3,-2][Y_index]
						});
					},0);
				}
			}
		};
		const MouseUpHandler = (event) => {
			if(isDragging){
				props.dispatch_layout_action(['dragend']);
				setIsDragging(false);
				document.body.style.cursor='';
				zIndexTimer = setTimeout(()=>{
					clearTimeout(zIndexTimer);
					zIndexTimer = null;
					setStillDragging(false);
				},500)
				clearInterval(scrollingTimer);
			}
		};
		if(isDragging){
			this_layout_course.offsetParent.addEventListener('mousemove',MouseMoveHandler);
			this_layout_course.offsetParent.addEventListener('mouseup',MouseUpHandler);
		}
		return(()=>{
			this_layout_course.offsetParent.removeEventListener('mousemove',MouseMoveHandler);
			this_layout_course.offsetParent.removeEventListener('mouseup',MouseUpHandler);
		});
	},[isDragging,initMousePos]);
	const MouseDownHandler = useCallback((event) => {
		if(!isDragging){
			clearTimeout(zIndexTimer);
			zIndexTimer = null;
			props.dispatch_layout_action(['dragstart', props.index , card.current.offsetHeight ]);
			setStillDragging(true);
			setIsDragging(true);
			setInitMousePos(event.clientY - card.current.offsetParent.offsetTop + card.current.offsetParent.scrollTop - card.current.offsetTop);
			setDragCoords(card.current.offsetTop);
			document.body.style.cursor='grabbing';
		}
	},[isDragging]);
	const MouseOverHandler = () => {
		if(props.group.selected_section!==null){
			setBC('#d5ebff');
			props.setMouseAction([props.group.id,'#d5ebff']);
		}
	};
	const MouseOutHandler = () => {
		setBC('white');
		props.setMouseAction([props.group.id,'white']);
	};
	const card_style_object = {
		top:(isDragging ? dragCoords+'px' : props.y!==null ? props.y+'px' : '0'),
		transition:(isDragging ? 'transform 0.5s' : props.slight ? 'top 0.2s, transform 0.5s' : 'top 0.5s, transform 0.5s' ),
		visibility:(isVisible ? 'visible' : 'hidden'),
		zIndex:(StillDragging ? '100' : props.zIndex),
		backgroundColor: BC
	};
	return (<div ref={card} onMouseOver={props.show?MouseOverHandler:null} onMouseOut={props.show?MouseOutHandler:null}
		className={ isDragging ? "schedule_summary_group dragging" : "schedule_summary_group"} style={card_style_object}>
			{useMemo(()=>
				<div className='scrollspace' style={{
						top:( isVisible ? card.current.offsetParent.offsetHeight+'px' : '0px')
				}}></div>
			,[isDragging])}
			<div className="schedule_summary_group_title">
				<DragHandle fill={BC} onMouseDown={MouseDownHandler} />
				<span style={{whiteSpace:'normal',margin:'0 5px'}}>{props.group.name}</span>
				<span style={{whiteSpace:'nowrap'}}>{props.group.creds+' cr.'}</span>
			</div>
			{useMemo(()=>
			<React.Fragment>
				{props.group.selected_section!==null ?
					<span className="schedule_summary_group_info">
						<table><tbody>{props.group.selected_section.parts[0].dhl.map(p=>
							<tr><td>{p.days}</td><td>{p.hours}</td></tr>
						)}</tbody></table>
					</span>
				: <span className="schedule_summary_group_info noselection">No section selected</span>}
				{props.group.selected_section!==null ?
					<div className="schedule_summary_group_other_list">
						<div className="schedule_summary_group_other_minilist" >
							<span>Selected section:</span>
							<div style={{display:'flex',justifyContent:'space-between',padding:'0 5px'}}>
								<span>{'Sec '+props.group.selected_section.secNum+' - CRN '+props.group.selected_section.crn}</span>
								<div style={{display:'flex',flexDirection:'column'}}
									>{props.group.selected_section.parts[0].dhl.map(p=><span>{p.locations}</span>)}</div>
							</div>
						</div>
						{props.group.selected_sections.length>0 ?
							<div className="schedule_summary_group_other_minilist" >
								<span>Other sections at the same time:</span>
								<div>{props.group.selected_sections.map(sec=>
									<button onClick={()=>{
										dispatch(ScheduleMasterActions.set_group_selected([props.group.id,sec.secNum]));
									}} className="schedule_summary_group_other_list_sec_button">
										<span>{'Sec '+sec.secNum+' - CRN '+sec.crn}</span>
										<div style={{display:'flex',flexDirection:'column'}}
											>{sec.parts[0].dhl.map(p=><span>{p.locations}</span>)}</div>	
									</button>
								)}</div>
							</div>
						: null}
					</div>
				: null}
			</React.Fragment>
			,[props.group])}
		</div>);
};

export default React.memo(ScheduleSummaryGroup);