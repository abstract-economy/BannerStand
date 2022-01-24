chrome.storage.local.get(['3'], result => {
let responsePackage = {index:3,tabid:result['3'][1]};
const courseInfo = result['3'][0];
fetch('https://ssb-prod.ec.aucegypt.edu/PROD/bwskfcls.P_GetCrse?term_in='+courseInfo.semValue+'&sel_subj=dummy&sel_subj='+courseInfo.subjectValue+'&SEL_CRSE='+courseInfo.courseValue+'&SEL_TITLE=&BEGIN_HH=0&BEGIN_MI=0&BEGIN_AP=a&SEL_DAY=dummy&SEL_PTRM=dummy&END_HH=0&END_MI=0&END_AP=a&SEL_CAMP=dummy&SEL_SCHD=dummy&SEL_SESS=dummy&SEL_INSTR=dummy&SEL_INSTR=%25&SEL_ATTR=dummy&SEL_ATTR=%25&SEL_LEVL=dummy&SEL_LEVL=%25&SEL_INSM=dummy&sel_dunt_code=&sel_dunt_unit=&call_value_in=&rsts=dummy&crn=dummy&path=1&SUB_BTN=View+Sections&SUB_BTN=View+Sections', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function(response) {
        if (!response.ok) { throw 'banner'; }
        return response.text();
    }).then(data=>{
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML=data;
  let arr = doc.getElementsByClassName('datadisplaytable');
  if(arr.length==0){
	if(doc.body.querySelector('#UserID') || doc.body.querySelector('#PIN')){
		responsePackage.pause_msgs=['Sign in to Banner','Keep a Banner tab open'];
		chrome.runtime.sendMessage(responsePackage);
	}
	else{
		if(courseInfo.link) responsePackage.error_msgs=['Banner made changes to its course offerings, this course is currently not available.'];
		else responsePackage.error_msgs=['Banner made changes to its course offerings, this course is currently not available.','Click refresh to refresh course offerings.'];
		chrome.runtime.sendMessage(responsePackage);
	}
  }
  else{
	const htmlTable = Array.from(arr[0].children[1].children);
	let table = new Array(htmlTable.length);
	for(let i=0;i<table.length;i++){
		let row = new Array(htmlTable[i].children.length);
		for(let z=0;z<row.length;z++){
			row[z] = htmlTable[i].children[z].textContent.trim();
		}
		table[i] = row;
	}
	responsePackage.data={table:table,termcode:courseInfo.semValue,termname:courseInfo.semName,subject:courseInfo.subjectValue,course:courseInfo.courseValue,title:courseInfo.courseName};
	chrome.runtime.sendMessage(responsePackage);
  }
}).catch(error =>{
    if(error==='banner') responsePackage.pause_msgs=['Banner refusing to communicate','Try signing in again'];
    else responsePackage.connerror=[
	['Banner refusing to communicate','Try signing in again'],
	['Check your internet connection']
    ];
    chrome.runtime.sendMessage(responsePackage);
  });
});
