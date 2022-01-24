import React , { useMemo , useCallback , useEffect , useRef , useState } from 'react';
import './LayoutCourse.css';
import Remove from 'icons/Remove';
import DragHandle from 'icons/DragHandle';
import CourseNotes from './LayoutCourseSections/CourseNotes';
import CourseMain from './LayoutCourseSections/CourseMain';

let zIndexTimer = null;

const LayoutCourse = (props) => {
	const [ isVisible , setIsVisible ] = useState(false);
	const [ StillDragging , setStillDragging ] = useState(false);
	const [ isDragging , setIsDragging ] = useState(false);
	const [ initMousePos , setInitMousePos ] = useState({ x:0 , y:0 });
	const [ dragCoords , setDragCoords ] = useState({ x:0 , y:0 });
	const coursename = props.tree.subject+' '+props.tree.course+' '+props.tree.name;
	const card = useRef();
	useEffect(()=>{
		let fast = false;
		const resizeObserver = new ResizeObserver(entries => {
			props.dispatch_layout_action(['lilbit', props.index , entries[0].borderBoxSize[0].blockSize , entries[0].borderBoxSize[0].inlineSize , fast ]);
			fast=true;
		});
		resizeObserver.observe(card.current);
		setIsVisible(true);
	},[]);
	useEffect(()=>{
		let scrollingTimer;
		const this_layout_course = card.current;
		const MouseMoveHandler = (event) => {
			if(isDragging){
				const ClientX = event.clientX - this_layout_course.offsetParent.offsetLeft;
				const mouseLeft = ClientX + this_layout_course.offsetParent.scrollLeft;
				const mouseTop = event.clientY + this_layout_course.offsetParent.scrollTop;
				props.dispatch_layout_action(['', mouseLeft , mouseTop ]);
				let X_index = 0 , Y_index = 0;
				let yFraction = (this_layout_course.offsetParent.clientHeight - event.clientY) / 30; // replace 30 by (this_layout_course.clientHeight  - initMousePos.y)
				if(yFraction <= 1){
					if(yFraction<0) yFraction = 0;
					Y_index = 1;
				}
				else if(event.clientY <= initMousePos.y) Y_index = 2;
				let xFraction = (this_layout_course.offsetParent.clientWidth - ClientX) / 30; // replace 30 by (this_layout_course.clientWidth - initMousePos.x)
				if(xFraction <= 1){
					if(xFraction<0) xFraction = 0;
					X_index = 1;
				}
				else if(ClientX <= initMousePos.x) X_index = 2;
				clearInterval(scrollingTimer);
				setDragCoords(prev=>{ return {
					x:(X_index ? prev.x : mouseLeft-initMousePos.x),
					y:(Y_index ? prev.y : mouseTop-initMousePos.y),
				};});
				if(Y_index || X_index){
					scrollingTimer = setInterval(()=>{
						setDragCoords(prev=>{ return {
							x:[prev.x,this_layout_course.offsetParent.scrollLeft+ClientX-initMousePos.x,this_layout_course.offsetParent.scrollLeft][X_index],
							y:[prev.y,this_layout_course.offsetParent.scrollTop+event.clientY-initMousePos.y,this_layout_course.offsetParent.scrollTop][Y_index]
						};});
						this_layout_course.offsetParent.scrollTo({
							left:this_layout_course.offsetParent.scrollLeft + [0,(1-xFraction)*6,-4][X_index],
							top: this_layout_course.offsetParent.scrollTop + [0,(1-yFraction)*6,-4][Y_index]
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
				},700)
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
			setInitMousePos({
				x: event.clientX - card.current.offsetParent.offsetLeft + card.current.offsetParent.scrollLeft -  card.current.offsetLeft,
				y: event.clientY + card.current.offsetParent.scrollTop - card.current.offsetTop
			});
			setDragCoords({ x: card.current.offsetLeft, y: card.current.offsetTop });
			document.body.style.cursor='grabbing';
		}
	},[isDragging]);
	const card_style_object = {
		left:(isDragging ? dragCoords.x+'px' : props.x+'px'),
		top:(isDragging ? dragCoords.y+'px' : props.y+'px'),
		transition:(isDragging ? 'transform 0.7s' : props.slight ? 'top 0.2s, left 0.2s, transform 0.7s' : 'top 0.7s, left 0.7s, transform 0.7s' ),
		visibility:(isVisible ? 'visible' : 'hidden'),
		zIndex:(StillDragging ? '100' : props.zIndex)
	};
	return (<div ref={card} className={ isDragging ? "layout_course dragging" : "layout_course"} style={card_style_object}>
			{useMemo(()=>
				<div className='scrollspace' style={{
						left:( isVisible ? card.current.offsetParent.offsetWidth+'px' : '0px'),
						top:( isVisible ? card.current.offsetParent.offsetHeight+'px' : '0px'),
				}}></div>
			,[isDragging])}
			{useMemo(() => {
				const NotesOne = props.tree.notes.one;
				return(<React.Fragment>
					<header className="courseheader">
						<div style={{display:'flex',alignItems:'flex-start'}}>
							<DragHandle onMouseDown={MouseDownHandler} />
							<span className="course_title" >{coursename}</span>
						</div>
						<div style={{display:'flex',alignItems:'flex-start'}}>
							<a target="_blank" href={props.tree.bannerlink} className="layout_course_banner_link">
								<span>Open</span>
								<span>in Banner</span>
							</a>
							<Remove
								choice={1}
								onClick={()=>{ props.dispatch_layout_action(['remove', props.index , card.current.offsetHeight ]); }}
							/>
						</div>
					</header>
					<section className="coursemiddle">
						<span>{props.tree.term}</span>
						{NotesOne[1][0] ?
							<div style={{display:'flex',flexDirection:'column'}}>
								{NotesOne[1][1].startEnd.map(d=><span>{d}</span>)}
							</div>
						: null}
						{NotesOne[2][0] ? <span>{NotesOne[2][1].campus}</span> : null}
						<CourseNotes notes={props.tree.notes} />
					</section>
				</React.Fragment>);
			},[])}
			{useMemo(()=>{
				const NotesOne = props.tree.notes.one;
				return(<CourseMain
					alphaSchedule={props.alphaSchedule}
					semester={[props.tree.termcode,props.tree.term]}
					content={props.tree.major}
					coursename={coursename}
					courseindex={props.index}
					sectionShowProps={[!NotesOne[0][0],!NotesOne[1][0],!NotesOne[2][0]]}
				/>);
			},[props.alphaSchedule])}
		</div>);
};

export default React.memo(LayoutCourse);