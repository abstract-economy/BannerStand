import React , { useMemo } from 'react';
import './CourseMain.css';
import CourseGroup from './CourseGroup';

const CourseMain = (props) => {
	const creds = useMemo(()=>Object.keys(props.content),[]);
	return(<ul>
		{creds.map((cr,i)=>
			<CourseGroup
				alphaSchedule={props.alphaSchedule}
				content={[cr,props.content[cr]]}
				sectionShowProps={props.sectionShowProps}
				semester={props.semester}
				groupname={props.coursename}
				groupfullname={creds.length>1 ? props.coursename+' '+cr+'cr.' : props.coursename}
				groupid={props.courseindex+''+i}
			/>
		)}
	</ul>);
};

export default CourseMain;