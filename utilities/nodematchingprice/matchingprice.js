
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

if(prods) {console.log('IT has begun. You will see a done message when IT has ended');}
//itterate through the products in the response from appSEOFetch and send for appProductGet if indexable
for(var j in prods['@OBJECTS']) {
	var thisPROD = prods['@OBJECTS'][j];
	if(!thisPROD['noindex'] && thisPROD.type === "pid" && (thisPROD.id.slice(-2) === "ST" || thisPROD.id.slice(-2) === "SB")) {
		getSets(thisPROD);
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
//		console.log(response.pid)
		var L = response.pid.length;
		thisObj.base = response.pid.slice(0,L - 2);
		thisObj.suffix = response.pid.slice(-2);
		thisObj.basePrice = response['%attribs']['zoovy:base_price'];
		initArray.push(thisObj);		
	});
}

//pulls last item in the array passed and compares it's base value to all other items.
//if a match is found, basePrices for each item are summed and stored in each item.
//each item is stored in an array that is then processed into a csv for product power tool.
//if a match is not found, the item was removed from the array anyway and the next item is processed.
function processinitArray(prods) {
//	console.log(prods);
	var hunter, prey, matchPrice;
	while(prods.length) {
		hunter = prods.pop(); 
		for(var k in prods) {
			if(prods[k].base === hunter.base) {
				prey = prods[k];
				prods.splice(k,1);
				matchPrice = parseFloat(hunter.basePrice) + parseFloat(prey.basePrice);
				hunter.matchPrice = matchPrice;
				prey.matchPrice = matchPrice;
				MATCHES.push(hunter);
				MATCHES.push(prey);
				hunter = {};
				prey = {};
			}
		}
	}

	console.log('Done, check ' +PATH+ ' to see the ouput.');
	//build the CSV and spit it out
	var outputsie = "%PRODUCTID,user:matching_price\n"
	for(var p in MATCHES) {
		outputsie += MATCHES[p].id + "," + MATCHES[p].matchPrice + "\n";
	}
	var FILENAME = 'matchprices.csv';
	fs.writeFileSync(PATH + FILENAME,outputsie);
//	var rawSets = JSON.stringify(prods);
//	fs.writeFileSync(PATH + "rawSets.txt",rawSets);
}

