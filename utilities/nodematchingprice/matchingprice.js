
//
// MATCHING PRICE GENERATOR
//


var fs = require('fs');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var dateFormat = require('dateformat');
var now = new Date();

var opts = require('nomnom')
        .option('domain', {
                abbr: 'd',
                required : true,
                help : 'domain to generate a sitemap for'
                })
        .option('path', {
                abbr: 'p',
                default : './',
                help : 'path to write the file'
                }).parse();

var DOMAIN = opts['domain'];
var PATH = opts['path'];
var MATCHES = new Array;           // a list of PRODUCTS with a calculated price for it and its matching peice

var CommerceEngine = require('./commerce-engine.js');
var ce = new CommerceEngine(DOMAIN, {'pipelineSize':250});

var request = new XMLHttpRequest();
request.open('GET','http://'+DOMAIN+'/jsonapi/call/v201411/appSEOFetch',false);	
request.send(null);

var prods = JSON.parse(request.responseText);
//console.log(prods['@OBJECTS']);

var initArray = [];				//used to hold appSEOFetch and appProductGet data when combined
var seoURLcount = 0;		//holds a count of how many urls were made w/ custom seo attrib
var nameURLcount = 0;	//holds a count of how many urls were made w/ prod_name

//itterate through the products in the response from appSEOFetch and send for appProductGet if indexable
for(var j in prods['@OBJECTS']) {
	var thisURLs = prods['@OBJECTS'][j];
	if(!thisURLs['noindex'] && thisURLs.type === "pid") {
		getSets(thisURLs);
	}
}

//once all of the products are processed, dispatch the appProductGet and call function to process it.
ce.dispatch(function(data) { processinitArray(initArray); });


function getSets(thisObj) {
ce.enqueue({
		"pid": thisObj.id,
		"_cmd": "appProductGet"
	}, 
	function(response){
		if(!response.noindex && response.pid != undefined && (response.pid.slice(-2) === "ST" || response.pid.slice(-2) === "SB")) { // TODO : change this 4 to a 2, and change ..SR to ST and SB for bmo
//			console.log(response.pid)
			var L = response.pid.length;
			thisObj.base = response.pid.slice(0,L - 2); // TODO : change this 4 to a 2 for bmo
			thisObj.suffix = response.pid.slice(-2); // TODO : change this 4 to a 2 for bmo
			thisObj.basePrice = response['%attribs']['zoovy:base_price'];
			initArray.push(thisObj);
		}
	});	
}


function processinitArray(prods) {
//	console.log(prods);
	var today = new Date(); 
	var datestr = dateFormat(now,"yyyy-mm-dd");
	//for(var i in prods) {
	while(prods.length) {
		var res = prods[0];
		switch(res.type) {
			case "pid" :
				var prey = res.suffix === "ST" ? res.base+"SB" : res.base+"ST"; // TODO : set these to "ST" and "SB" for bmo
				for(var k in prods) {
					if(prods[k].id === prey) {
						var matchPrice = Number(prods[k].basePrice) + Number(res.basePrice);
						res.matchPrice = matchPrice+'';
						prods[k].matchPrice = matchPrice+'';
						MATCHES.push(prods[k]);
						MATCHES.push(res);
						prods.splice(0,1); //remove this product
						prods.splice(k-1,1); //remove the matching piece for this product (index is 1 shorter because first .splice() shortened array)
					}
				}
				break;
			default : 
				console.log("How did we get into default?"); console.log(res);
				break;
		}
	}
	
	//build the CSV and spit it out
	var outputsie = ""
	for(var p in MATCHES) {
		outputsie += MATCHES[p].id + "," + MATCHES[p].matchPrice + "\n";
	}
	var FILENAME = 'matchprices.csv';
	fs.writeFileSync(PATH + FILENAME,outputsie);
}

