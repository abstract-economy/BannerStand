import React , { useReducer , useEffect , useMemo } from 'react';
import './ScheduleSummary.css';
import ScheduleSummaryGroup from './ScheduleSummaryGroup';
import LayoutFiller from '../Layout/LayoutFiller';

const rowSpacing = 10;
const leeway = 15;

const NewState = (state,slight=false) => {
	return {layout_filler: state.layout_filler,
		voiid: state.voiid,
		hash: state.hash,
		slight:slight,
		colHeight: state.colHeight,
		layout_courses: state.layout_courses};
};

const FUCKOFF = (state,row,lastdisplay) => {
		for(let counter=0;counter<state.voiid.row;counter++)
			state.layout_courses[counter].y -= (state.voiid.height+rowSpacing);
		state.colHeight -= (state.voiid.height+rowSpacing);
		state.voiid.row = row;
		state.layout_filler.display = lastdisplay;
		if(row===0) state.voiid.y = state.layout_filler.y = (state.colHeight + rowSpacing);
		else state.voiid.y = state.layout_filler.y = state.layout_courses[row-1].y;
		for(let counter=0;counter<state.voiid.row;counter++)
			state.layout_courses[counter].y += (state.voiid.height+rowSpacing);
		state.colHeight += (state.voiid.height+rowSpacing);
		return NewState(state);
};

const LayoutReducer = (state,action) => {
		if(!action[0]){ // ['', mouseLeft , event.clientY ]
			const y = action[1];
			if(y>=state.colHeight){
				if(state.voiid.row===0 && state.layout_filler.y===rowSpacing && state.layout_filler.display){
					return state;
				}
				else return FUCKOFF(state,0,true);
			}
			else{
				for(let row=state.layout_courses.length-1 ; row>=0 ; row--){
					if( y<=(state.layout_courses[row].y + leeway) && y>=(state.layout_courses[row].y - rowSpacing - leeway) && state.voiid.row!==row+1){
						return FUCKOFF(state,row+1,false);
					}
				}
			}
			return state;
		}
		else if(action[0]==='dragstart' && state.hash[action[1]]!==undefined){ // ['dragstart', index , cardheight ]
			const row = state.hash[action[1]];
			const elementheight = action[2];
			state.layout_filler.height = elementheight;
			delete state.hash[action[1]];
			state.voiid = {  // information that we'll use to insert element in dragend....this info will keep changing while dragging to reach a final value
				index:action[1],
				row:row,
				y:state.layout_courses[row].y,
				height:elementheight
			};
			state.layout_courses.splice(state.voiid.row,1);
			for(let counter = state.voiid.row ; counter < state.layout_courses.length ; counter++)
				state.hash[state.layout_courses[counter].index]--;
			if(state.voiid.row===0){ return FUCKOFF(state,0,true); }
			return NewState(state);
		}
		else if(action[0]==='dragend' && state.voiid.index!==undefined){ // voiid , addonly_render , hash , _2d
			state.hash[state.voiid.index] = state.voiid.row;
			state.layout_courses.splice(state.voiid.row,0,{index:state.voiid.index,y:state.voiid.y});
			for(let counter = state.voiid.row+1 ; counter < state.layout_courses.length ; counter++)
				state.hash[state.layout_courses[counter].index]++;
			state.layout_filler = {y:0,height:0,display:false};
			state.voiid = {};
			return NewState(state);
		}
		else if(action[0]==='show'){ // ['show' , index]
			const newindex = action[1];
			state.layout_courses.push({index:newindex,y:rowSpacing});
			state.hash[newindex] = state.layout_courses.length-1;
			return NewState(state);
		}
		else if(action[0]==='lilbit'){ // ['lilbit', index , newheight , width]
			const row = state.hash[action[1]];
			const newheight = action[2];
			const removing_group = action[2]===0?rowSpacing:0;
			let diff;
			if(row-1>=0) diff = newheight - ( state.layout_courses[row-1].y - state.layout_courses[row].y - rowSpacing ) - removing_group;
			else if(row===0) diff = newheight - ( state.colHeight - state.layout_courses[0].y ) - removing_group;
			if(diff===0) return state;
			else{
				if(row-1>=0) for( let i = row - 1 ; i >= 0 ; i-- ) state.layout_courses[i].y += diff;
				state.colHeight += diff;
				if(action[2]===0){
					state.layout_courses.splice(row,1);
					for(let counter = row ; counter < state.layout_courses.length ; counter++)
						state.hash[state.layout_courses[counter].index]--;
					delete state.hash[action[1]];
				}
				return NewState(state,action[4]);
			}
		}
		else return state;
};

const ScheduleSummary = (props) => {
	const [ LayoutState , DispatchLayoutAction ] = useReducer(LayoutReducer , {
		layout_filler:{y:0,height:0,display:false},
		voiid:{},
		hash:{},
		colHeight:0,
		slight:false,
		layout_courses:[]
	});
	return(<div id="schedule_summary" style={{right:props.schedule_active ? '0' : '-15rem'}}>
		<div id="schedule_summary_header">
			<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
				<span style={{visibility:props.ScheduleMaster.semester===null?'hidden':'visible'}}>{props.ScheduleMaster.semesterName}</span>
				<button className={props.show?'my-schedule-button clicked':'my-schedule-button'}
				onClick={()=>{props.show_my_schedule(prev=>!prev);}} >My schedule</button>
			</div>
			<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
				<span>Total credits</span>
				<span>{props.ScheduleMaster.total_creds+' cr.'}</span>
			</div>
		</div>
		<div id="schedule_summary_body">
			{LayoutState.layout_filler.display ?
					<LayoutFiller
						y={LayoutState.layout_filler.y}
						height={LayoutState.layout_filler.height}
						x={'0.75rem'}
						width={'12rem'}
					/>
			: null}
			{props.ScheduleMaster.groupIds.map((gid,i)=>{
				if(gid===null) return null;
				else{
					const hash = LayoutState.hash[i];
					return(<ScheduleSummaryGroup
						key={i}
						index={i}
						show={props.show}
						y={hash!==undefined?LayoutState.layout_courses[hash].y:null}
						group={props.ScheduleMaster.groups[gid]}
						dispatch_layout_action={DispatchLayoutAction}
						setMouseAction={props.setMouseAction}
					/>);
				}
			})}
		</div>
	</div>);
};

export default React.memo(ScheduleSummary);