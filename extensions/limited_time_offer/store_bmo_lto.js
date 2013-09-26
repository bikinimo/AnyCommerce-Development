/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */


var store_bmo_lto = function() {
	var theseTemplates = new Array('');
	var r = {

		vars : {
			params : {
			},
		},

	
////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;
				
				app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj){
					var $context = $(app.u.jqSelector('#', infoObj.parentID));
					var failSafeProd = '2654S';
					var failSafeDate = '2012101910';
					
					if(!$context.data('hasLTO')) {
						//get the sku/data product array from products.json
						$.getJSON("extensions/limited_time_offer/products/products.json?_="+(new Date().getTime()))
							.done(function(data){
							//app.u.dump(data);
							//app.u.dump(data.product.length)
							var faultyProducts = data.product[data.product.length-1];
							var a = new Date(app.ext.store_bmo.u.makeUTCFloridaTimeMS());
							var endTime = app.ext.store_bmo.u.millisecondsToYYMMDDHH(a); //current time in Florida
								//loop through and make sure that products exist and end dates are not in the past
							for(var i = 0; i < data.product.length; i++) {
								var tprod = data.product[i];
								//app.u.dump(tprod.date);
								if(tprod.date <= endTime) {
									app.u.dump('Ending date for'); app.u.dump(data.product[i]); app.u.dump('has already passed. Enter a later date in products.json.');
									data.product[i] = "";
									//app.u.dump(data.product[i]);
								}
// uncomment when				else if(!app.data['appProductGet|'+tprod.pid]) {
// appProductGet| issue				app.u.dump('SKU for '); app.u.dump(data.product[i]); app.u.dump('does not pass validation. Enter a new SKU in products.json');
// is resolved						data.product[i] = "";
//								}
							}

								//records for products that do not exist or have past dates will be set to ""
								//check for the first non "" index and use its record for anyContent
							for (var j = 0; j < data.product.length; j++) {
								if(data.product[j] != "") {
									app.ext.store_bmo_lto.vars.params = data.product[j];
									break;
								}
								else {
									//default to last item in the list and this "deal has ended" text will be shown
									if(faultyProducts != 'undefined') {app.ext.store_bmo_lto.vars.params = faultyProducts;}
								}
							}
							//app.u.dump('the beat goes on'); app.u.dump(app.ext.store_bmo_lto.vars.params);
							//app.ext.store_bmo_lto.vars.params = $.extend(true, [], data.product);
							//app.u.dump('data:'); app.u.dump(data.product);
							//app.u.dump('params:'); app.u.dump(app.ext.store_bmo_lto.vars.params);
							
								//set event date to that of the chosen record
							app.ext.store_bmo.vars.eventdate = app.ext.store_bmo_lto.vars.params.date;
								//start any content for LTO section
							app.ext.store_bmo_lto.u.loadLTOProduct();
							$context.data('hasLTO',true);
							
						}).fail(function() {
								//reading the product record in products.json has failed message in console,
								//display some product to fill space, set the date to past so it just looks like the deal is over until problem is fixed. 
							app.u.dump('*** In store_bmo_lto and products.json was not read. Failsafe product is being displayed. Please correct the error in products.json');
							app.ext.store_bmo_lto.vars.params.sku = failSafeProd;	//set default prod
							app.ext.store_bmo.vars.eventdate = failSafeDate;		//set past date
							app.ext.store_bmo_lto.u.loadLTOProduct();				//load this default info. w/ anyContent
						}); //getJSON
					}
				}]);
				
				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN app.ext.stor_bmo_lto.callbacks.init.onError');
				}
			},
			
			renderLTOProduct : {
				// call function with the data response passed as argument 
				// (dataresponse is returned from the model when the API request returns, 
				// generaly just a repeat of _tag object you passed, but contains error response durring an error)
				onSuccess:function(responseData){		
					// call anycontent (from anyplugins) on class to put content in ** '.limitedOffer','.homeTemplate' **, 
					//using the template you want to render with ** "limitedTimeOffersTemplate" **, using a pointer to the data that was returned ** "datapointer":responseData.datapointer **. 
					app.u.dump('ResponseData pointer'); app.u.dump(responseData.datapointer);// app.u.dump($('.prodViewerAddToCartForm ','.match_'+app.data[responseData.datapointer].pid));
					$('.limitedOffer','.homeTemplate').anycontent({"templateID":"limitedTimeOffersTemplate","datapointer":responseData.datapointer}); 
				},
				onError:function(responseData){	
					app.u.dump('Error in extension: store_bmo_lto renderLTOProduct'); // error response goes here if needed
				}
			}
			
			
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
			
			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
			
			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			loadLTOProduct : function() {
			
				var prodLTO = app.ext.store_bmo_lto.vars.params.sku;
				
				var obj = {									// object to hold product id for product
					"pid" : prodLTO
				};
					//console.debug(obj);					// see what was returned in console
				var _tag = {								// create holder for call back
					"callback":"renderLTOProduct",			// call back function (in callbacks above)
					"extension":"store_bmo_lto"				// extension that holds call back (this extension you're in)
				};
				app.calls.appProductGet.init(obj, _tag);	// call appProductGet.init on the product id with the callback and callback location
				
				//execute calls
				app.model.dispatchThis('mutable');			
				
			} //loadLTOProduct
				
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			}, //e [app Events]

		} //r object.
		
	return r;
	}