import React , { useState } from 'react';
import './CourseNotes.css';
import CourseNote from './CourseNote';

const CourseNotes = (props) => {
	const [ Toggled , setToggled ] = useState(false);
	const class_name = ( props.notes.urgent ? 'button-coursenotes urgent' : 'button-coursenotes')
	const One = props.notes.one;
	return(
		<React.Fragment>
			<button className={ Toggled ? class_name+" clicked" : class_name}
				onClick={()=>{ setToggled(prev=>!prev); }} >Notes</button>
			<div className={Toggled ? "coursenotes" : "coursenotes nodisplay"}>
				<table className="main_notes"><tbody>
					{(One[0][0] && One[0][1].show) ? <CourseNote one={true} n={One[0][1].secNums.length} urgent={true} note={One[0][1].active} /> : null}
					{props.notes.strict.map(note =>
						<CourseNote
							one={false}
							urgent={props.notes.urgent}
							note={note}
						/>
					)}
					{One[3][0] ? <CourseNote one={true} n={One[3][1].secNums.length} urgent={false} note={One[3][1].main ? One[3][1].main : 'No notes'} /> : null}
				</tbody></table>
			</div>
		</React.Fragment>
	);
};

export default CourseNotes;