chrome.storage.local.get(['0'], result => {
 let responsePackage = {index:0,id:result['0'][0],semester:result['0'][1],tabid:result['0'][3]}
 fetch('https://ssb-prod.ec.aucegypt.edu/PROD/bwskflib.P_SelDefTerm',{method: 'GET'})
 .then(function(response) {
        if (!response.ok) { throw 'banner'; }
        return response.text();
 }).then(data => {
   const doc = document.implementation.createHTMLDocument();
   doc.body.innerHTML=data;
   let select = doc.querySelector('#term_id');
   if(select){
    let options = Array.from(select.children).filter(function(option){
      let text = option.textContent.replace(/\( *view *only *\)/i,'').trim(); 
      return /^((summer|spring|winter|fall) *(20[2-9][0-9]))$/i.test(text);
     });
    let dat = new Array(options.length+1);
    dat[0] = {value:'',name:'Select term'};
    for(let i=0 ; i<options.length ; i++)
       dat[i+1] = {value:options[i].value,name:options[i].textContent.replace(/\( *view *only *\)/i,'').trim()};
    responsePackage.data=dat;
    chrome.runtime.sendMessage(responsePackage);
   }
   else { responsePackage.msgs=['Sign in to Banner','Keep a Banner tab open',...result['0'][2]]; chrome.runtime.sendMessage(responsePackage); }
 }).catch(error =>{
    if(error==='banner') responsePackage.msgs=['Banner refusing to communicate','Try signing in again',...result['0'][2]];
    else responsePackage.connerror=[
	['Banner refusing to communicate','Try signing in again',...result['0'][2]],
	['Check your internet connection',...result['0'][2]]
    ];
    chrome.runtime.sendMessage(responsePackage);
 });
});

