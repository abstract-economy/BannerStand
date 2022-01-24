chrome.storage.local.get(['1'], result => {
 let responsePackage = {index:1,id:result['1'][0],semester:result['1'][1],tabid:result['1'][2]};
 fetch('https://ssb-prod.ec.aucegypt.edu/PROD/bwckgens.p_proc_term_date?p_calling_proc=P_CrseSearch&p_term='+result['1'][1][0],{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
    .then(function(response) {
        if (!response.ok) { throw 'banner'; }
        return response.text();
    }).then(data =>{
     const doc = document.implementation.createHTMLDocument();
     doc.body.innerHTML=data;
     let select = doc.querySelector('#subj_id');
     if (select){
      if(select.children.length==0){
       responsePackage.msgs=['Banner made changes to its Course Offerings',result['1'][1][1]+' is no longer available','Click refresh'];
       chrome.runtime.sendMessage(responsePackage);
      }
      else{
	let dat=new Array(select.children.length);
	for(let i=0;i<select.children.length;i++) dat[i] = {value:select.children[i].value,name:select.children[i].textContent.trim()};
	responsePackage.data=dat;
	chrome.runtime.sendMessage(responsePackage);
      }
     }
     else{ responsePackage.msgs=['Sign in to Banner','Keep a Banner tab open']; chrome.runtime.sendMessage(responsePackage); } 
    }).catch(error =>{
     if(error==='banner') responsePackage.msgs=['Banner refusing to communicate','Try signing in again'];
     else responsePackage.connerror=[
	['Banner refusing to communicate','Try signing in again'],
	['Check your internet connection']
     ];
     chrome.runtime.sendMessage(responsePackage);
    });
});