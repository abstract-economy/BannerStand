export const binarySearch = (arr,id) => {
	let start = 0 , end = arr.length-1 , i = Math.floor(end+start/2);
	while(start<=end){
		if(id > arr[i].id) start = i+1;
		else if(id < arr[i].id) end = i-1;
		else return [true,i];
		i = Math.floor(end+start/2);
	}
	return [false,start];
}

export const merge_maintain = (_arr1_,_arr2_) => {
	let result = new Array(_arr1_.length + _arr2_.length) , iter1 = 0 , iter2 = 0;
	let arr1 = new Array(_arr1_.length+1);
	for(let i=0;i<_arr1_.length;i++) arr1[i] = _arr1_[i];
	arr1[arr1.length-1] = {id:Infinity};
	let arr2 = new Array(_arr2_.length+1);
	for(let i=0;i<_arr2_.length;i++) arr2[i] = _arr2_[i];
	arr2[arr2.length-1] = {id:Infinity};
	for(let i=0;i<result.length;i++){
		if(arr1[iter1].id < arr2[iter2].id)
			result[i] = arr1[iter1++];
		else
			result[i] = arr2[iter2++];
	}
	return result;
};

export const add_set = (arr,id) => {
	let res = binarySearch(arr,id);
	if(!res[0]) arr.splice(res[1],0,{id:id});
	return arr;
};

export const remove_set = (arr,id) => {
	let res = binarySearch(arr,id);
	if(res[0]) arr.splice(res[1],1);
	return arr;
};

export const inverse_maintain = (main,burner) => {
	let result = new Array(main.length-burner.length),
	burnerIter = 0 , iter = 0;
	for(let i=0;i<main.length;i++){
		if( !burner[burnerIter] || main[i].id!==burner[burnerIter].id)
			result[iter++] = main[i];
		else
			burnerIter++;
	}
	return result;
};

export const substitute = (main,obj) => {
	let newstate = new Array(main.length);
	for(let i=0;i<main.length;i++){
		newstate[i] = main[i];
		if(newstate[i].id===obj.id) newstate[i] = obj;
	}
	return newstate;
};