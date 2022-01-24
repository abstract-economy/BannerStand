/*const send_logs = (log_msg) => {
	try{
		const success = navigator.sendBeacon('https://mighty-journey-91832.herokuapp.com/log',log_msg);
		if(!success){ console.log('sendBeacon not working!'); throw(new Error()); }
	}
	catch{
		fetch('https://mighty-journey-91832.herokuapp.com/log',{method:'POST',headers:{'Content-Type': 'text/plain;charset=UTF-8'},body:log_msg})
		.then( response => {return response.text();
		}).then( data => {
		}).catch( error => {
		});
	}
};*/

const send_logs = (log_msg) => {
	fetch('https://mighty-journey-91832.herokuapp.com/log',{method:'POST',headers:{'Content-Type': 'text/plain;charset=UTF-8'},body:log_msg})
	.then( response => {return response.text();
	}).then( data => {
	}).catch( error => {
	});
};

export default send_logs;