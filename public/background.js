chrome.action.onClicked.addListener(function(tab){
 chrome.tabs.query({url:chrome.runtime.getURL('index.html')},function(tabs){
    if(tabs.length==0){
     chrome.tabs.create({url:'index.html'});
    }
    else{chrome.tabs.update(tabs[0].id, {highlighted: true});}
 });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	chrome.storage.local.getBytesInUse(null,function(bytes){
		if(bytes>0){
			chrome.tabs.query({url:chrome.runtime.getURL('index.html')},function(tabs){
				if(tabs.length==0){
					chrome.storage.local.clear(function() {
						let error = chrome.runtime.lastError;
						if (error) console.log(error);
					});
				}
			});
		}
	});
});
