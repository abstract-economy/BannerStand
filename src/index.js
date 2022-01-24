/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import tabInfo from 'tab-info';
import { Provider } from 'react-redux';
import store from './store/index';

chrome.tabs.getCurrent((tab)=>{
	tabInfo.id = tab.id;
	Object.freeze(tabInfo);
	ReactDOM.render(
		<React.StrictMode>
			<Provider store={store} >
				<App />
			</Provider>
		</React.StrictMode>,
		document.body
	);
});
