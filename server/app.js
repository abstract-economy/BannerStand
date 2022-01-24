/*
 * JS Implementation of MurmurHash2
 * 
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 * 
 * @param {string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
*/

/*
git add .
git commit -m ""
git push heroku master
heroku logs -t
*/

function murmurhash2_32_gc(str, seed) {
  var
    l = str.length,
    h = seed ^ l,
    i = 0,
    k;
  
  while (l >= 4) {
  	k = 
  	  ((str.charCodeAt(i) & 0xff)) |
  	  ((str.charCodeAt(++i) & 0xff) << 8) |
  	  ((str.charCodeAt(++i) & 0xff) << 16) |
  	  ((str.charCodeAt(++i) & 0xff) << 24);
    
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

	h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }
  
  switch (l) {
  case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
  case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
  case 1: h ^= (str.charCodeAt(i) & 0xff);
          h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
}

function add(accumulator, a) {
  return accumulator + a;
}

function hash(str){
	return str.toLowerCase()
		.replace(/(and)|[aeis\\\*\-\[\]\{\}\.\?\!\:\&\/\(\)\,\;\'\"]/g,'')
		.split(' ')
		.map(word => murmurhash2_32_gc(word.trim(),1) ).reduce(add,0);
}

const mongoose=require('mongoose');
const body_parser = require('body-parser');
let jsonParser = body_parser.json();
let textParser = body_parser.text();
const https=require('https');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const util = require('util');

app.disable('etag').disable('x-powered-by');

app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "chrome-extension://imblicgngoenafbknilckenjbkmmkioo");
            res.header("Access-Control-Allow-Headers", "Origin, Content-Type");
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.header("Access-Control-Max-Age","600");
            next();
        });
 
mongoose.connect(MONGODBURL, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function(){
	console.log("Mongoose default connection is open");
});

mongoose.connection.on('error', function(err){
	console.log("Mongoose default connection has occured "+err);
});

mongoose.connection.on('disconnected', function(){
	console.log("Mongoose default connection is disconnected");
});

process.on('SIGINT', function(){
	mongoose.connection.close(function(){
		console.log("Mongoose default connection is disconnected due to application termination");
		process.exit(0)
	});
});

const analyticsSchema = new mongoose.Schema({html:String});
let Analytic = mongoose.model("Analytic",analyticsSchema);
function saveAnalytic(data){
 const analytic = new Analytic({html:data});
 analytic.save(function(err,analytic,n){if(err){console.log('ERROR SAVING ANALYTIC!');}});
}

const coreCourseSchema=new mongoose.Schema({
  cataloguelink:String,
  categories:[{name:String,value:String}],
  details:[{value:String,groups:[{name:String,courses:[{subject:String,code:String,name:String,link:String}]}],courses:[{subject:String,code:String,name:String,link:String}]}]
 }, { capped: { size: 150000, max: 1} });

function areArrsEqual(arr1,arr2){
	if(arr1.length==arr2.length){
		for(let i=0;i<arr1.length;i++){
			if(arr1[i]!==arr2[i]) return false;
		}
		return true;
	}
	else return false;
}

const NotesTypesFunctions = [
		[ (load,p)=>{
			load.active = p.active;
			load.show = p.show;
		}, (load,p)=>{
			return load.active === p.active;
		} ],						// active
		[ (load,p)=>{
			load.startEnd = p.startEnd;
		}, (arr1,arr2)=>{
			return areArrsEqual(arr1.startEnd,arr2.startEnd);
		} ],						// startEnd
		[ (load,p)=>{
			load.campus = p.campus;
			load.shortcampus = p.shortcampus;
		}, (load,p)=>{
			return load.shortcampus === p.shortcampus;
		} ],						// campus
		[ (load,p)=>{
			load.main = p.main;
			load.hash = p.hash;
		}, (load,p)=>{
			return load.hash === p.hash;
		} ]						// main
];

function addtoallnotes(allnotes,secPack,secnum){
	let alreadyForkedArr=[];
	let newForkArr = [];

	for(let i=0;i<allnotes.one.length;i++){
		let target = allnotes.one[i];
		if(target[0]){
			if(target[1]){
				if( NotesTypesFunctions[i][1](target[1],secPack[i]) ) target[1].secNums.push(secnum);
				else {
					newForkArr.push(i);
					target[0] = false;
				}
			}
			else{
				target[1] = {secNums:[secnum]};
				NotesTypesFunctions[i][0](target[1],secPack[i]);
			}
		} else alreadyForkedArr.push(i);
	}

	if(newForkArr.length){
		if(allnotes.strict.length===0) allnotes.strict.push({secNums:allnotes.one[newForkArr[0]][1].secNums});
		for(let f=0;f<newForkArr.length;f++){
			for(let i=0;i<allnotes.strict.length;i++){
				NotesTypesFunctions[newForkArr[f]][0](allnotes.strict[i],allnotes.one[newForkArr[f]][1]);
			}
			allnotes.one[newForkArr[f]][1] = false;
		}
		allnotes.strict.push({secNums:[secnum]});
		for(let i=0;i<alreadyForkedArr.length;i++) newForkArr.push(alreadyForkedArr[i]);
		for(let f=0;f<newForkArr.length;f++){
			NotesTypesFunctions[newForkArr[f]][0](allnotes.strict[allnotes.strict.length-1],secPack[newForkArr[f]]);
		}
	}
	else if(alreadyForkedArr.length){
		for(let i=0;i<allnotes.strict.length;i++){
			let found = true;
			for(let f=0;f<alreadyForkedArr.length;f++){
				if( !(NotesTypesFunctions[alreadyForkedArr[f]][1](allnotes.strict[i],secPack[alreadyForkedArr[f]])) ){
					found=false;
					break;
				} 
			}
			if(found){
				allnotes.strict[i].secNums.push(secnum);
				return;
			}
		}
		allnotes.strict.push({secNums:[secnum]});
		for(let f=0;f<alreadyForkedArr.length;f++){
			NotesTypesFunctions[alreadyForkedArr[f]][0](allnotes.strict[allnotes.strict.length-1],secPack[alreadyForkedArr[f]]);
		}
	}
	else {} //do nothing because the new section at-hand has been absorbed by all ones
}

function addtimeandplace(dhl,days,hours,place,startEnd){
	if(days=='' || /^( *t *b *a *)$/i.test(days) || hours=='' || /^( *t *b *a *)$/i.test(hours)){ days='Time TBA'; hours=''; }
	for(let i=0;i<dhl.length;i++)
		if(dhl[i].days==days && dhl[i].hours==hours){
			dhl[i].locations.add(place);
			dhl[i].startEnd.add(startEnd);
			return;
		}
	dhl.push({days:days,hours:hours,locations:new Set([place]),startEnd:new Set([startEnd])});
}

function addnote(note,piece){
	if(piece && !(/^( *[A-Z0-9]{3,4} *[A-Z0-9]{3,4} *)$/i.test(piece))){
		let noteHash = hash(piece);
		if( !(note.hashes.includes(noteHash)) ){
			note.hashes.push(noteHash);
			note.main.push(piece);
		}
	}
}

function get_time_object(timestring){
	let time=timestring.split('-').map(t=>{return t.trim();});
	let final=new Array(2);
	for(let i=0;i<2;i++){
		final[i]=parseInt(time[i].replace(':',''),10);
		if(time[i].search('pm')!==-1 && !(final[i]>=1200 && final[i]<1260)){
			final[i]+=1200;
		}
	}
	return {start:final[0],end:final[1]};
}

function get_times(dhl){
	let arr = [];
	let hourarr;
	let timeobject;
	for(let i=0 ; i < dhl.length ; i++){
		if(dhl[i].days==='Time TBA') arr.push({day:'TBA',time:'',time_string:'',locations_index:i});
		else{
			timeobject = get_time_object(dhl[i].hours);
			for(let z=0;z<dhl[i].days.length;z++)
				arr.push({day:dhl[i].days[z],time:timeobject,time_string:dhl[i].hours,locations_index:i});
		}
	}
	return arr;
}

const months={
	'01':'Jan',
	'02':'Feb',
	'03':'Mar',
	'04':'Apr',
	'05':'May',
	'06':'Jun',
	'07':'Jul',
	'08':'Aug',
	'09':'Sep',
	'10':'Oct',
	'11':'Nov',
	'12':'Dec'
};

function processClass(table,i,section,note,same_time_sections){
	addnote(note,table[i][5]);
	let rowlength , professors = new Set() , dhl = [] , startEndNote = new Set() , time_hash = 0 , days , hours ;
	do {
		rowlength = table[i].length;
		days = table[i][rowlength-12];
		hours = table[i][rowlength-11];
		addnote(note,table[i][rowlength-1]); 
		table[i][rowlength-4].split(',').forEach(prof=>{professors.add(prof.replace(/\(p\)/ig,'').trim());});
		let se = table[i][rowlength-3].split('-').map(d=>{ d=d.split('/'); d[0]=months[d[0]]; return d.join('/').trim(); }).join('-');
		addtimeandplace(dhl,days,hours,table[i][rowlength-2],se);
		time_hash += murmurhash2_32_gc(days+hours,1);
		startEndNote.add(se);
		i++;
	} while(i<table.length && !table[i][1] && table[i][8]=='CLAS')
	dhl.sort(function(firstEl,secondEl){return secondEl.days.length - firstEl.days.length;});
	dhl.forEach(obj=>{ obj.locations=Array.from(obj.locations).join('/'); obj.startEnd=Array.from(obj.startEnd).join('/'); });
	professors = Array.from(professors).sort().join(' , ');
	if(/^( *t *b *a *)$/i.test(professors)) professors = 'Professor TBA';
	section.profs = professors;
	section.parts[0].dhl = dhl;
	section.startEndNote = Array.from(startEndNote);
	for(let q=0;q<same_time_sections[0].length;q++){
		if(time_hash===same_time_sections[0][q]){
			same_time_sections[1][q].sections.push(section);
			same_time_sections[1][q].allsectionsfull &= section.full;
			section.subgroup_loc = q;
			return i;
		}
	}
	same_time_sections[0].push(time_hash);
	same_time_sections[1].push({
		times: get_times(dhl),
		sections: [section],
		allsectionsfull: section.full
	});
	section.subgroup_loc = same_time_sections[0].length-1;
	return i;
}

function processExam(table,i,section,note){
	const i_start = i;
	let rowlength , dhl = [] ;
	while(i<table.length && !table[i][1] && table[i][8]=='EXAM'){
		rowlength = table[i].length;
		addnote(note,table[i][rowlength-1]);
		let se = new Set();
		table[i][rowlength-3] = table[i][rowlength-3].replace(/\s/g,'');
		table[i][rowlength-3].split('-').forEach(d=>{ d=d.split('/'); d[0]=months[d[0]]; se.add(d.join('/').trim());});
		if(se.size===1) se = Array.from(se)[0];
		else se = table[i][rowlength-3];
		addtimeandplace(dhl,table[i][rowlength-12],table[i][rowlength-11],table[i][rowlength-2],se);
		i++;
	}
	dhl.sort(function(firstEl,secondEl){return secondEl.days.length - firstEl.days.length;});
	dhl.forEach(obj=>{ obj.locations=Array.from(obj.locations).join('/'); obj.startEnd=Array.from(obj.startEnd).join(' / '); });
	if(i_start!==i) section.parts.push({type:'Exam',dhl:dhl});
	return i;
}

/*
- one section is :
	- either Active or not
- order is not predictable i.e. 'CLAS' then 'EXAM' then 'CLAS' then 'UNKNOWN' then 'EXAM' etc. with each section type having multiple parts
- order is not to be changed upon display
- a section type part has its :
	- section type
	- start/end date
	- notes
- the first type part in a section is always of type 'CLAS' then 'EXAM' if exists ('CLAS' or 'EXAM' only), no alternating again i.e. NO 'CLAS','EXAM','CLAS'..etc.
- all slots on what's left on subsequent parts other than main 'CLAS' is empty
- array positions of each piece of info in table is assumed to be consistent
- use code to evaluate each term's advanced search all courses' page to confirm assumptions
*/

function titleRemoveMeaningless(title,subject,course){
	if((subject==='RHET' || subject==='CORE') && (course==='1010' || course==='1020'))
		return title.toLowerCase().replace(/(and)|(freshman *seminar *:*)|(freshman *writing *:*)|[\saeis\\\*\-\[\]\{\}\.\?\!\:\&\/\(\)\,\;\'\"]/gi,'');
	else return title.toLowerCase().replace(/(and)|[\saeis\\\*\-\[\]\{\}\.\?\!\:\&\/\(\)\,\;\'\"]/gi,'');
}

function checktitle(majorDict,section,subject,course){
	if(section.title in majorDict[section.creds].rest) return true;
	else{
		let titles = Object.keys(majorDict[section.creds].rest);
		let sectionAdjustedTitle = titleRemoveMeaningless(section.title,subject,course);
		for(let i=0;i<titles.length;i++){
			if(sectionAdjustedTitle===majorDict[section.creds].rest[titles[i]].checkVersion){
				section.title=titles[i];
				return true;
			}
		}
		return sectionAdjustedTitle;
	}
}

function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

/*if(searchingfor.size < searchingfor.add(creds).size){
				console.log('MAKING REQUEST FOR CREDS',creds);
				credsDict[creds]='Lecture';
				https.get('https://ssb-prod.ec.aucegypt.edu/PROD/bwckschd.p_disp_detail_sched?term_in='+req.body.termcode+'&crn_in='+crn,
         				{headers: {"Content-Type": "application/x-www-form-urlencoded"}},(response)=>{
         				var html='';
         				response.on('data',(chunk)=>{html+=chunk});
         				response.on('end',()=>{
         					const schtype=html.match(/<br \/>\n([A-Za-z ]+)Schedule Type/is)[1].trim();
						credsDict[creds]=schtype;
						console.log('RETURNED FROM CREDS REQUEST!',JSON.stringify(searchingfor),JSON.stringify(credsDict));
						searchingfor.delete(creds);
						if(searchingfor.size===0){
							res.send(JSON.stringify({
								term:req.body.termname,
								subject:req.body.subject,
								course:req.body.course,
								name:req.body.title,
								bannerlink:bannerlink,
								major:majorDict,
								creds:credsDict,
								notes:allnotes,
							}));
							console.log('TREE INFORMATION :',req.body.termname,req.body.title, 'processing time is',Date.now()-now,'ms');
						}
         			 	});
        			});
			}*/
// catch error from http request for credsDict (lookup)

const meanings={NC:'New Campus',DT:'Downtown Campus'};
app.post("/tree",jsonParser,function(req,res){
	if(!(Object.keys(req.body).length==6
		&& eqSet(new Set(Object.keys(req.body)), new Set(['table','termname','termcode','subject','course','title']))
		&& Array.isArray(req.body.table))){
			res.status(400).send('error');
	}
	else{
		let
		majorDict = {};
		//id = 0;
		//credsDict = {},
		//searchingfor = new Set();
		const bannerlink = "https://ssb-prod.ec.aucegypt.edu/PROD/bwskfcls.P_GetCrse?term_in="+req.body.termcode+"&sel_subj=dummy&sel_subj="+req.body.subject+"&SEL_CRSE="+req.body.course+"&SEL_TITLE=&BEGIN_HH=0&BEGIN_MI=0&BEGIN_AP=a&SEL_DAY=dummy&SEL_PTRM=dummy&END_HH=0&END_MI=0&END_AP=a&SEL_CAMP=dummy&SEL_SCHD=dummy&SEL_SESS=dummy&SEL_INSTR=dummy&SEL_INSTR=%25&SEL_ATTR=dummy&SEL_ATTR=%25&SEL_LEVL=dummy&SEL_LEVL=%25&SEL_INSM=dummy&sel_dunt_code=&sel_dunt_unit=&call_value_in=&rsts=dummy&crn=dummy&path=1&SUB_BTN=View+Sections&SUB_BTN=View+Sections";
	let allnotes = {
		//	active		startEnd	campus		main
		one:[ [true,false] , [true,false] , [true,false] , [true,false] ],
		strict:[],
		get urgent(){
			return !this.one[0][0] || !this.one[1][0] || !this.one[2][0];
		}
	};
	for(let i=2;i<req.body.table.length;){
		const crn = parseInt(req.body.table[i][1],10);
		if(crn){
			//id++;
			const row = req.body.table[i];
			let rowlength = row.length;
			const creds = parseFloat(row[8],10);
			//additional network request to get what each cred hour is -> goes here
			const mainActual = parseInt(row[rowlength-9],10);
			const mainCapacity = parseInt(row[rowlength-10],10);
			let section = {
				//id: id,
				crn : crn ,
				secNum : row[4] ,
				campus : meanings[row[6]] ,
				active : row[7] ,
				creds : creds ,
				title : row[9] ,
				main : mainActual+'/'+mainCapacity ,
				full : (mainActual-mainCapacity)>=0 ,
				waitList : row[rowlength-6]+' / '+row[rowlength-7] ,
				parts : [{type:'CLAS'}]
			};
			//profs str,startEndNotes arr,note str
			let note={hashes:[],main:[]};
			let subgroups;
			if(!majorDict[section.creds])
				majorDict[section.creds]={
					subgroups:[[],[]],
					rest:{}
				};
			subgroups = majorDict[section.creds].subgroups;
			i = processClass(req.body.table,i,section,note,subgroups);
			i = processExam(req.body.table,i,section,note);
			section.note = note.main = note.main.join(' , ');
			const secPack = [
				{active: section.active, show: section.active!=='Active'},
				{startEnd: section.startEndNote},
				{campus: section.campus, shortcampus: row[6]},
				{main: section.note,hash: hash(section.note)}
			];
			addtoallnotes(allnotes,secPack,section.secNum);
			let ans = checktitle(majorDict,section,req.body.subject,req.body.course);
			if(ans===true){
        			if(section.profs in majorDict[section.creds].rest[section.title].rest){
					majorDict[section.creds].rest[section.title].rest[section.profs].rest.push(section);
				}
				else{
					majorDict[section.creds].rest[section.title].rest[section.profs]={
						rest: [section]
					};
				}
			}
			else majorDict[section.creds].rest[section.title]={
				checkVersion: ans,
				rest:{
					[section.profs]:{
						rest:[section]
					}
				}
			};
		}
	}
	res.send(JSON.stringify({
		term: req.body.termname,
		termcode : req.body.termcode,
		subject: req.body.subject,
		course: req.body.course,
		name: req.body.title,
		bannerlink: bannerlink,
		major: majorDict,
		notes: allnotes,
		hash : murmurhash2_32_gc(req.body.termcode+req.body.subject+req.body.course,1)
	}));
	console.log('TREE INFORMATION :',req.body.termname,req.body.subject,req.body.course,req.body.title);
	}
});


app.get("/",function(req,res){res.status(200).send('saaah dude');});


app.post("/log",textParser,function(req,res){
	console.log('LOGGING ',req.body);
	res.status(204).send('No content.');
});

app.post("/core",jsonParser,function(req,res){
	if(!((Object.keys(req.body).length===1||(Object.keys(req.body).length===2&&'crxVersion' in req.body)) && 'term' in req.body && req.body.term.length==6 && req.body.term[0]=='2' && req.body.term[1]=='0')){
		console.log('ERROR in first condition...');
		res.status(404).send(JSON.stringify([false,[],['Unexpected error retrieving Core Curriculum courses.'] ]));
	}
	else{
		console.log('CORE FOR TERM',req.body.term,'from version',req.body.crxVersion);
		const otherstatements = req.body.crxVersion===undefined?
		['Hi. The old schedule layout is now available.',
		'4 steps to update:',
		'- Click on puzzle icon top right.',
		'-> Manage extensions.',
		'-> Developer mode top right.',
		'-> Update top left.']:[
		'- Click on the schedule icon on the top.',
		'- To enable the \'My schedule\' button on the far right , you have to tick beside at least one section :)'];
		const coreSem=mongoose.model('__'+req.body.term,coreCourseSchema);
		coreSem.findOne(function(err,doc){
			if(err){
				console.log('ERROR retreiving from database...');
				res.status(404).send(JSON.stringify([false,otherstatements,['Unexpected error retrieving Core Curriculum courses.'] ]));
			}
			else{
				if(!doc) res.send(JSON.stringify([false,otherstatements,['Should be available within minutes.']]));
				else res.send(JSON.stringify([true,otherstatements,doc]));
			}
		});
	}
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));



/*
records or documents saved in collection.
collection has a schema that the documents/records follow. collection is in database.
model is same as collection.
*/
