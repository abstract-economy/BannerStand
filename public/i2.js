chrome.storage.local.get(['2'], result => {
 let responsePackage={
	index:2,
	id:result['2'][0],
	tabid:result['2'][3]
 };
 fetch('https://ssb-prod.ec.aucegypt.edu/PROD/bwskfcls.P_GetCrse?rsts=dummy&crn=dummy&term_in='+result['2'][1][0]+'&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj='+result['2'][2]+'&sel_crse=&sel_title=&sel_from_cred=&sel_to_cred=&sel_ptrm=%25&begin_hh=0&begin_mi=0&end_hh=0&end_mi=0&begin_ap=x&end_ap=y&path=1&SUB_BTN=Course+Search&SUB_BTN=Course+Search',{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
    .then( response => {
        if (!response.ok) { throw 'banner'; }
        return response.text();
    }).then(data =>{
     const doc = document.implementation.createHTMLDocument();
     doc.body.innerHTML=data;
     let arr = doc.querySelectorAll('.dddefault');
     if(arr.length==0){
      if(doc.body.querySelector('#UserID') || doc.body.querySelector('#PIN'))
       {responsePackage.msgs=['Sign in to Banner','Keep a Banner tab open']; chrome.runtime.sendMessage(responsePackage);}
      else
       {responsePackage.msgs=['Banner made changes to its Course Offerings','Click refresh']; chrome.runtime.sendMessage(responsePackage);}
     }
     else{
      let dat=new Array(arr.length/2);
      for(let i=0;i<arr.length;i+=2) dat[i/2] = {
	semValue: result['2'][1][0],
	semName: result['2'][1][1],
	subjectValue: result['2'][2],
	courseValue: arr[i].textContent,
	courseName: arr[i+1].textContent,
	link: null
      };
      responsePackage.data=[{courses:dat}];
      chrome.runtime.sendMessage(responsePackage);
     }
    }).catch(error =>{
     if(error==='banner') responsePackage.msgs=['Banner refusing to communicate','Try signing in again'];
     else responsePackage.connerror=[
	['Banner refusing to communicate','Try signing in again'],
	['Check your internet connection']
     ];
     chrome.runtime.sendMessage(responsePackage);
    });

});