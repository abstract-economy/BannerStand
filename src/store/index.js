import { createSlice , configureStore } from '@reduxjs/toolkit';
import { binarySearch , add_set , remove_set , inverse_maintain } from '../components/Plan/Layout/LayoutCourseSections/helper-functions';

const find_insert = (dayarr,time) => {
	let res = binarySearch(dayarr,time);
	if(!res[0]) dayarr.splice(res[1],0,{id:time,groups:[]});
	return res[1];
};

const inverse = (arr,id) => {
	let res = new Array(arr.length-1);
	let count = 0;
	for(let i=0;i<arr.length;i++){
		if(arr[i]!==id)
			res[count++] = arr[i];
	}
	return res;
};

const update_add = (subgroup1,subgroup2,group2) => {
	if(subgroup1.clashing_groups[subgroup2.groupIndex]===undefined)
		subgroup1.clashing_groups[subgroup2.groupIndex] = new Array(group2.subgroups.length);
	if(!subgroup1.clashing_groups[subgroup2.groupIndex][subgroup2.Index]){
		subgroup1.clashing_groups[subgroup2.groupIndex][subgroup2.Index] = subgroup2.Id;
		if(subgroup2.checked){
			add_set(subgroup1.force,group2.fullname);
		}
	}
};

const removeSubgroup_ = (state,subgroupid) => {
	let subgroup = state.subgroups[subgroupid];
	subgroup.checked = false;
	let group = state.groups[subgroup.groupId];
	group.selected_section = null;
	group.selected_sections = null;
	for(let i=0;i<subgroup.clashing_groups.length;i++){
		if(subgroup.clashing_groups[i]!==undefined){
			for(let z=0;z<subgroup.clashing_groups[i].length;z++){
				if(subgroup.clashing_groups[i][z]){
					let clashing_subgroup = state.subgroups[subgroup.clashing_groups[i][z]];
					clashing_subgroup.force = inverse_maintain(clashing_subgroup.force,[{id:group.fullname}]);
				}
			}
		}
	}
	for(let i=0;i<subgroup.times.length;i++){
		const day = subgroup.times[i].day;
		//if(day==='TBA') 
		state.displayed_schedule[day] = state.displayed_schedule[day].filter(obj=>(obj.groupid!==subgroup.groupId)
		||(obj.locations_index!==subgroup.times[i].locations_index));
		/*else{
			const start = subgroup.times[i].time.start;
			state.displayed_schedule[day] = state.displayed_schedule[day].filter(obj=>obj.id!==start);
		}*/
	}
};

const ScheduleActiveSlice = createSlice({
	name: 'ScheduleActive',
	initialState: false,
	reducers:{
		toggle(state){
			return !state;
		}
	}
});

const ScheduleMaster = createSlice({
	name: 'ScheduleMaster',
	initialState: {
		groupIds:[],
		groups:{},
		subgroups:{},
		matrix:{ 'U':[], 'M':[], 'T':[], 'W':[], 'R':[], 'F':[], 'S':[], 'TBA':[] },
		nofullmode:false,
		total_creds:0,
		semester:null,
		semesterName: null,
		semesterGroups:[],
		last_action: null,
		displayed_schedule:{ 'U':[], 'M':[], 'T':[], 'W':[], 'R':[], 'F':[], 'S':[], 'TBA':[] }
	},
	reducers: {
		set_group_selected(state,action){
			const group = state.groups[action.payload[0]];
			const subgroup = state.subgroups[group.subgroups[group.selected_section.subgroup_loc]];
			group.selected_section = subgroup.sections.find(s=>s.secNum===action.payload[1]);
			if(state.nofullmode) group.selected_sections = subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum&&!s.full);
			else group.selected_sections = subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum);
			return state;
		},
		toggle_nofullmode(state){
			state.last_action = undefined;
			if(state.nofullmode){
				for(let i=0;i<state.groupIds.length;i++){
					if(state.groupIds[i]){
						let group = state.groups[state.groupIds[i]];
						if(group.selected_section){
							let selected_subgroup = state.subgroups[group.subgroups[group.selected_section.subgroup_loc]];
							group.selected_sections = selected_subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum);
						}
					}
				}
				state.nofullmode = false;
				state.last_action = 'toggle_nofullmode became false';
			}
			else{
				for(let i=0;i<state.groupIds.length;i++){
					if(state.groupIds[i]){
						let group = state.groups[state.groupIds[i]];
						if(group.selected_section){
							let selected_subgroup = state.subgroups[group.subgroups[group.selected_section.subgroup_loc]];
							if(selected_subgroup.allsectionsfull){
								removeSubgroup_(state,selected_subgroup.Id);
							}
							else{
								if(group.selected_section.full) group.selected_section = selected_subgroup.sections.find(s=>!s.full);
								group.selected_sections = selected_subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum&&!s.full);
							}
						}
					}
				}
				state.nofullmode = true;
				state.last_action = 'toggle_nofullmode became true';
			}
			return state;
		},
		addGroup(state,action){
			state.last_action = undefined;
			if(!state.semesterGroups.length){
				state.semester = action.payload.semester[0];
				state.semesterName = action.payload.semester[1];
			}
			state.semesterGroups.push(action.payload.id);
			const new_group_index = state.groupIds.length;
			let newgroup = {
				id: action.payload.id,
				name: action.payload.name,
				fullname: action.payload.fullname,
				selected_section: null,
				selected_sections: null,
				index: new_group_index,
				creds: parseInt(action.payload.creds),
				process_selected_fn : action.payload.process_selected_fn,
				subgroups: new Array(action.payload.subgroups.length)
			};
			state.total_creds+=newgroup.creds;
			state.groupIds.push(newgroup.id);
			state.groups[newgroup.id] = newgroup;
			for(let i=0;i<newgroup.subgroups.length;i++){
				let subgroup = {
					groupId: newgroup.id,
					groupIndex: new_group_index,
					Id: newgroup.id+i,
					Index: i,
					clashing_groups: new Array(state.groupIds.length),
					checked: false,
					sections: action.payload.subgroups[i].sections,
					times: action.payload.subgroups[i].times,
					allsectionsfull: action.payload.subgroups[i].allsectionsfull,
					force:[]
				};
				newgroup.subgroups[i] = subgroup.Id;
				state.subgroups[subgroup.Id] = subgroup;
				for(let z=0;z<subgroup.times.length;z++){
					let dayarr = state.matrix[subgroup.times[z].day];
					if(subgroup.times[z].day==='TBA') dayarr.push(subgroup.Id);
					else{
						let start = find_insert(dayarr,subgroup.times[z].time.start);
						let end = find_insert(dayarr,subgroup.times[z].time.end);
						for(let q=start;q<=end;q++){
							for(let a=0;a<dayarr[q].groups.length;a++){
								let clashing_subgroup = state.subgroups[dayarr[q].groups[a]];
								if(clashing_subgroup.groupIndex!==new_group_index){
									update_add(subgroup,clashing_subgroup,state.groups[clashing_subgroup.groupId]);
									update_add(clashing_subgroup,subgroup,newgroup);
								}
							}
						}
						dayarr[start].groups.push(subgroup.Id);
						dayarr[end].groups.push(subgroup.Id);
					}
				}
			}
			state.last_action = 'add Group';
			return state;
		},
		removeGroup(state,action){
			state.last_action = undefined;
			const groupid = action.payload;
			const group = state.groups[groupid];
			if(!group){ state.last_action = 'remove Group';  return state; }
			if(group.selected_section) removeSubgroup_(state,group.subgroups[group.selected_section.subgroup_loc]);
			state.total_creds-=group.creds;
			state.semesterGroups = state.semesterGroups.filter(g=>g!==groupid);
			if(!state.semesterGroups.length){
				state.semester = null;
				state.semesterName = null;
			}
			for(let i=0;i<group.subgroups.length;i++){
				const subgroup = state.subgroups[group.subgroups[i]];
				for(let z=0;z<subgroup.times.length;z++){
					let dayarr = state.matrix[subgroup.times[z].day];
					if(subgroup.times[z].day==='TBA') state.matrix[subgroup.times[z].day] = inverse(state.matrix[subgroup.times[z].day],subgroup.Id);
					else{
						const start = binarySearch(dayarr,subgroup.times[z].time.start)[1];
						const end = binarySearch(dayarr,subgroup.times[z].time.end)[1];
						dayarr[start].groups = inverse(dayarr[start].groups,subgroup.Id);
						dayarr[end].groups = inverse(dayarr[end].groups,subgroup.Id);
					}
				}
				for(let z=0;z<subgroup.clashing_groups.length;z++){
					if(subgroup.clashing_groups[z]!==undefined){
						for(let q=0;q<subgroup.clashing_groups[z].length;q++){
							if(subgroup.clashing_groups[z][q])
								state.subgroups[subgroup.clashing_groups[z][q]].clashing_groups[subgroup.groupIndex] = undefined;
						}
					}
				}
				delete state.subgroups[group.subgroups[i]];
			}
			state.groupIds[group.index] = null;
			delete state.groups[groupid];
			state.last_action='remove Group';
			return state;
		},
		addSubgroup(state,action){
			state.last_action = undefined;
			const selected_section = action.payload[0];
			const subgroupid = action.payload[1];
			let subgroup = state.subgroups[subgroupid];
			let group = state.groups[subgroup.groupId];
			if(group.selected_section) removeSubgroup_(state,group.subgroups[group.selected_section.subgroup_loc]);
			for(let i=0;i<subgroup.clashing_groups.length;i++){
				if(subgroup.clashing_groups[i]!==undefined){
					for(let z=0;z<subgroup.clashing_groups[i].length;z++){
						if(subgroup.clashing_groups[i][z]){
							let clashing_subgroup = state.subgroups[subgroup.clashing_groups[i][z]];
							if(clashing_subgroup.checked) removeSubgroup_(state,subgroup.clashing_groups[i][z]);
							add_set(clashing_subgroup.force,group.fullname);
						}
					}
				}
			}
			subgroup.checked = true;
			subgroup.force = [];
			group.selected_section = selected_section;
			if(state.nofullmode) group.selected_sections = subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum&&!s.full);
			else group.selected_sections = subgroup.sections.filter(s=>s.secNum!==group.selected_section.secNum);
			for(let i=0;i<subgroup.times.length;i++){
				const day = subgroup.times[i].day;
				if(day==='TBA')
					state.displayed_schedule[day].push({groupid:subgroup.groupId
					,time_string:subgroup.times[i].time_string,locations_index:subgroup.times[i].locations_index});
				else{
					const start = subgroup.times[i].time.start;
					const object = {id:start,groupid:subgroup.groupId
					,time_string:subgroup.times[i].time_string,locations_index:subgroup.times[i].locations_index};
					const ix = binarySearch(state.displayed_schedule[day],start)[1];
					state.displayed_schedule[day].splice(ix,0,object);
				}
			}
			state.last_action = 'add SUB group';
			return state;
		},
		removeSubgroup(state,action){
			state.last_action = undefined;
			removeSubgroup_(state,action.payload);
			state.last_action = 'remove SUB group';
			return state;
		}
	}
});

const store = configureStore({
	reducer:{
		ScheduleActive : ScheduleActiveSlice.reducer,
		ScheduleMaster : ScheduleMaster.reducer
	}
});

export const ScheduleActiveActions = ScheduleActiveSlice.actions;
export const ScheduleMasterActions = ScheduleMaster.actions;

export default store;