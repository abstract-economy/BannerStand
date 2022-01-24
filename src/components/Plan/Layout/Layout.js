import React , { useReducer , useEffect , useMemo } from 'react';
import './Layout.css';
import LayoutCourse from './LayoutCourse';
import LayoutFiller from './LayoutFiller';
import { useSelector } from 'react-redux';

const colSpacing = 15;
const rowSpacing = 30;
const leeway = 10;
const topMostCol_zIndex = 90; // assuming no more than 90 columns will ever be made

const NewState = (state,slight=false) => {
	return {layout_filler: state.layout_filler,
		voiid: state.voiid,
		addonly_render: state.addonly_render,
		hash: state.hash,
		slight:slight,
		colwidth:state.colwidth,
		_2d: state._2d,
		alphaSchedule: state.alphaSchedule};
};

const process_NewState = (state,column,row,lastdisplay) => {
		for(let counter=0;counter<state.voiid.row;counter++)
			state._2d[state.voiid.col].layout_courses[counter].y -= (state.voiid.height+rowSpacing);
		state._2d[state.voiid.col].height -= (state.voiid.height+rowSpacing);
		state.voiid.col = column;
		state.voiid.row = row;
		state.layout_filler.x = state._2d[column].xstart;
		state.layout_filler.display = lastdisplay;
		if(row===0) state.voiid.y = state.layout_filler.y = (state._2d[state.voiid.col].height + rowSpacing);
		else state.voiid.y = state.layout_filler.y = state._2d[state.voiid.col].layout_courses[row-1].y;
		for(let counter=0;counter<state.voiid.row;counter++)
			state._2d[state.voiid.col].layout_courses[counter].y += (state.voiid.height+rowSpacing);
		state._2d[state.voiid.col].height += (state.voiid.height+rowSpacing);
		return NewState(state);
};

const get_lastcol = (state) => {
	let wc = state._2d.length-1;
	while(state._2d[wc]===null && wc--);
	return wc;
};

const get_firstcol = (state) => {
	let fc = 0;
	while(state._2d[fc]===null && ++fc);
	return fc;
};

const LayoutReducer = (state,action) => {
		if(!action[0]){ // ['', mouseLeft , event.clientY ]
			const x = action[1];
			const y = action[2];
			const lastcol = get_lastcol(state);
			if(x>=state._2d[lastcol].xend){
				state._2d.push({
					xstart: state._2d[lastcol].xend + colSpacing,
					xend: state._2d[lastcol].xend + colSpacing + state.colwidth,
					height: 0,
					layout_courses: []
				});
				return NewState(state);
			}
			else{
				for(let column=0;column<state._2d.length;column++){
					if(state._2d[column]!==null && x>=state._2d[column].xstart && x<=state._2d[column].xend){
						const arr = state._2d[column].layout_courses;
						if(y>=state._2d[column].height){
							if(state.voiid.col===column && state.voiid.row===0
							&& state.layout_filler.x===state._2d[column].xstart && state.layout_filler.y===rowSpacing && state.layout_filler.display)
								return state;
							else return process_NewState(state,column,0,true);
						}
						else{
							for(let row=arr.length-1 ; row>=0 ; row--){
								if( y<=(arr[row].y + leeway) && y>=(arr[row].y - rowSpacing - leeway)
								&& (state.voiid.col!==column || state.voiid.row!==row+1)){
									return process_NewState(state,column,row+1,false);
								}
							}
							return state;
						}	
					}
				}
				return state;
			}
		}
		else if(action[0]==='dragstart' && state.hash[action[1]]!==undefined){ // ['dragstart', index , cardheight ]
			const col = state.hash[action[1]].col;
			const row = state.hash[action[1]].row;
			const elementheight = action[2];
			state.layout_filler.height = elementheight;
			delete state.hash[action[1]];
			state.voiid = {  // information that we'll use to insert element in dragend....this info will keep changing while dragging to reach a final value
				index:action[1],
				col:col,
				row:row,
				y:state._2d[col].layout_courses[row].y,
				height:elementheight
			};
			state._2d[state.voiid.col].layout_courses.splice(state.voiid.row,1);
			for(let counter = state.voiid.row ; counter < state._2d[state.voiid.col].layout_courses.length ; counter++)
				state.hash[state._2d[state.voiid.col].layout_courses[counter].index].row--;
			if(state.voiid.row===0) { return process_NewState(state,state.voiid.col,0,true); }
			return NewState(state);
		}
		else if(action[0]==='dragend' && state.voiid.index!==undefined){ // voiid , addonly_render , hash , _2d
			state.hash[state.voiid.index] = {col:state.voiid.col,row:state.voiid.row};
			state._2d[state.voiid.col].layout_courses.splice(state.voiid.row,0,{index:state.voiid.index,y:state.voiid.y});
			for(let counter = state.voiid.row+1 ; counter < state._2d[state.voiid.col].layout_courses.length ; counter++)
				state.hash[state._2d[state.voiid.col].layout_courses[counter].index].row++;
			state.layout_filler = {x:0,y:0,height:0,display:false};
			state.voiid = {};
			return NewState(state);
		}
		else if(action[0]==='show'){ // ['show' , tree]
			state.addonly_render.push(action[1]);
			const firstcol = get_firstcol(state);
			const arr = state._2d[firstcol].layout_courses;
			const newindex = state.addonly_render.length-1;
			arr.push({index:newindex,y:rowSpacing});
			state.hash[newindex] = {col:firstcol,row:arr.length-1};
			for(let i=0;i<state.alphaSchedule.length;i++){
				if(state.alphaSchedule[i] && state.alphaSchedule[i][0]===action[1].hash){
					state.alphaSchedule.push([action[1].hash,false]);
					return NewState(state);
				}
			}
			state.alphaSchedule.push([action[1].hash,true]);
			return NewState(state);
		}
		else if(action[0]==='lilbit'){ // ['lilbit', index , newheight , width]
			if(action[2]===0) return state;
			if(state.colwidth===null){
				state._2d[0].xend = state._2d[0].xstart+action[3];
				state.colwidth = state._2d[0].xend - state._2d[0].xstart;
			}
			const row = state.hash[action[1]].row;
			const col = state.hash[action[1]].col;
			const newheight = action[2];
			let diff;
			if(row-1>=0) diff = newheight - ( state._2d[col].layout_courses[row-1].y - state._2d[col].layout_courses[row].y - rowSpacing );
			else if(row===0) diff = newheight - ( state._2d[col].height - state._2d[col].layout_courses[0].y );
			if(diff===0) return state;
			else{
				if(row-1>=0) for( let i = row - 1 ; i >= 0 ; i-- ) state._2d[col].layout_courses[i].y += diff;
				state._2d[col].height += diff;
				return NewState(state,action[4]);
			}
		}
		else if(action[0]==='remove'){ // [ 'remove' , index , height ]
			const col = state.hash[action[1]].col;
			const row = state.hash[action[1]].row;
			const height = action[2]+rowSpacing;
			state._2d[col].height -= height;
			state._2d[col].layout_courses.splice(row,1);
			for(let counter = 0 ; counter < row ; counter++)
				state._2d[col].layout_courses[counter].y -= height;
			for(let counter = row ; counter < state._2d[col].layout_courses.length ; counter++)
				state.hash[state._2d[col].layout_courses[counter].index].row--;
			state.addonly_render[action[1]] = null;
			delete state.hash[action[1]];
			if(state._2d[col].layout_courses.length===0 && get_lastcol(state)!==col){
				for(let i=col+1;i<state._2d.length;i++){
					if(state._2d[i]!==null){
						state._2d[i].xstart-= (colSpacing + state.colwidth);
						state._2d[i].xend-= (colSpacing + state.colwidth);
					}
				}
				state._2d[col] = null;
			}
			const _hash = state.alphaSchedule[action[1]][0];
			const isalpha = state.alphaSchedule[action[1]][1];
			state.alphaSchedule[action[1]] = null;
			if(isalpha){
				for(let i=state.alphaSchedule.length-1;i>=0;i--){
					if(state.alphaSchedule[i] && state.alphaSchedule[i][0]===_hash){
						state.alphaSchedule[i][1] = true;
						return NewState(state);
					}
				}
			}
			return NewState(state);
		}
		else return state;
};

const Layout = (props) => {
	const ScheduleActive = useSelector(state=>state.ScheduleActive);
	const [ LayoutState , DispatchLayoutAction ] = useReducer(LayoutReducer , {
		layout_filler:{x:0,y:0,height:0,display:false},
		voiid:{},
		addonly_render:[],
		hash:{},
		slight:false,
		colwidth:null,
		_2d:[
			{xstart: colSpacing,
			xend: null,
			height: 0,
			layout_courses: []}
		],
		alphaSchedule: []
	});
	useEffect(()=>{ if(props.new_course!==null) DispatchLayoutAction(props.new_course); },[props.new_course]);
	const layout_width = useMemo(()=>{
		if(!props.collapsed&&!ScheduleActive)
			return 'calc(100vw - 22rem)';
		else if(props.collapsed&&ScheduleActive)
			return 'calc(100vw - 15rem)';
		else if(!props.collapsed&&ScheduleActive)
			return 'calc(100vw - 37rem)';
		else if(props.collapsed&&!ScheduleActive)
			return '100vw';
	},[props.collapsed,ScheduleActive]);
	return(
		<div id='layout' style={{left: props.collapsed ? '0' : '22rem',width: layout_width}}>
			{useMemo(()=>
				<React.Fragment>
					{LayoutState.layout_filler.display ?
					<LayoutFiller
						x={LayoutState.layout_filler.x+'px'}
						y={LayoutState.layout_filler.y}
						height={LayoutState.layout_filler.height}
						width={'30em'}
					/> : null}
					{LayoutState.addonly_render.map((course,i)=>{
						const hash = LayoutState.hash[i];
						if(hash)
							return(<LayoutCourse
									key={i}
									index={i}
									tree={course}
									dispatch_layout_action={DispatchLayoutAction}
									x={LayoutState._2d[hash.col].xstart}
									y={LayoutState._2d[hash.col].layout_courses[hash.row].y}
									slight={LayoutState.slight}
									zIndex={topMostCol_zIndex - hash.col}
									alphaSchedule={LayoutState.alphaSchedule[i][1]}
							/>);
						else if(course)
							return(<LayoutCourse
									key={i}
									index={i}
									tree={course}
									dispatch_layout_action={DispatchLayoutAction}
									x={null}
									y={null}
									zIndex={''}
									alphaSchedule={LayoutState.alphaSchedule[i][1]}
							/>);
						else return null;
					})}
				</React.Fragment>
			,[LayoutState])}
	  	</div>
	);
};

export default React.memo(Layout);
