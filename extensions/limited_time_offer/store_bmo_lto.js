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

	
////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;
		
				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN app.ext.stor_bmo_lto.callbacks.init.onError');
				}
			},

			
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
		
				//Makes sure item's lto date is not before or after now.
				//limite-time-offer attrib must be passed in, and be in the format begin.end: "yyyymmddhh.yyyymmddhh"
			isLTO : function($tag, data) {
				var ltoStart = data.value.split('.')[0];
				var ltoEnd = data.value.split('.')[1];
				var d = new Date(app.ext.store_bmo.u.makeUTCTimeMS());
				var nowTime = app.ext.store_bmo.u.millisecondsToYYYYMMDDHH(d);
				
				if(ltoStart > nowTime && ltoEnd < nowTime && lto != undefinded) {
			//	if(data.value < nowTime) { //for testing until lto format is fixed in attribs (begin.end).
						//the product is the limited time offer item for now, show it.
					$tag.show();
				}
				else {
					//is not yet or already past it's limited time offer status, hidden by default so do nada.
				}
		//		app.u.dump('--> got here.'); app.u.dump(ltoStart); app.u.dump(ltoEnd);
			},
			
				//checks promo end date/time against current date/time. Deletes item to show next if promo is over,
				//calls countdown() to show timer on item if promo isn't over.
			countdownCheck : function($tag, data) {
				var prod = data.value['%attribs'];
				
				if(prod && prod['user:limited_time_offer']) {
					var prodTime = prod['user:limited_time_offer'];		
			//		var d = new Date(app.ext.store_bmo.u.makeUTCFloridaTimeMS());
					var d = new Date(app.ext.store_bmo.u.makeUTCTimeMS());
					var nowTime = app.ext.store_bmo.u.millisecondsToYYYYMMDDHH(d); //current time in Florida		
					
						//check if end of promotion has been reached, remove if it has.
					if(prodTime <= nowTime) {
						app.u.dump('Ending date for'); app.u.dump(data.value.pid); app.u.dump('has already passed. Enter a later date in product record.');
						$tag.parent().remove();
					}
					else {
							//promotion is still good load countdown with it
						app.ext.store_bmo_lto.u.countdown($tag.parent(),prodTime);
					}
				}
				else {
					$tag.parent().remove();
				}
			} //countdownCheck
	
		}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are executed by an event or action.
//any functions that are recycled should be here.
		u : {
		
				//applies LTO discount to product price if it has one, and 
			applyLTODiscount : function(pid, amount) {
				if(pid) {
					pid = app.u.makeSafeHTMLId(pid);
					var prod = app.data['appProductGet|'+pid];
					var discount = 0; //if no discount, multiply by 0 will keep price the same
				
						//if the product has a limited time offer and any discount the displayed price needs to be changed
					if(prod && prod['%attribs']['user:limited_time_offer'] && (prod['%attribs']['user:discount_15'] || prod['%attribs']['user:discount_20'] || prod['%attribs']['user:discount_25'])) {
						prod = prod['%attribs'];
				//		var d = new Date(app.ext.store_bmo.u.makeUTCFloridaTimeMS());
						var d = new Date(app.ext.store_bmo.u.makeUTCTimeMS());
						var nowTime = app.ext.store_bmo.u.millisecondsToYYYYMMDDHH(d);
						if(nowTime < prod['user:limited_time_offer']) {
							if(prod['user:discount_15']) {
								discount = 0.15;
//								app.u.dump('--> DISCOUNT IS 15%')
							}
							else if(prod['user:discount_20']) {
								discount = 0.2;
//								app.u.dump('--> DISCOUNT IS 20%')
							}
							else if(prod['user:discount_25']) {
								discount = 0.25;
//								app.u.dump('--> DISCOUNT IS 25%')
							}
							else {
//								app.u.dump('--> DISCOUNT IS 0%')
							}
						}
					} //end discount if

					amount = amount - (amount * discount);
				}
				
				return amount;
			},
		
				//runs countdown timer against current time and passed argument of product lto end time
			countdown : function($context, prodTime) {
				var endTime = new Date(app.ext.store_bmo.u.yyyymmdd2Pretty(prodTime));
//				app.u.dump('End Time is: '); app.u.dump(endTime.getTime());
				var cl = $('form[name="clock"]', $context);
		//		var count=Math.floor((endTime.getTime()-app.ext.store_bmo.u.makeUTCFloridaTimeMS())/1000);
				var count=Math.floor((endTime.getTime()-app.ext.store_bmo.u.makeUTCTimeMS())/1000);
				
				if(count<=0) {
					$('input[name=days]', cl).val('00');
					$('input[name=hours]', cl).val('00');
					$('input[name=mins]', cl).val('00');
					$('input[name=secs]', cl).val('00');
					
					$('#deal',$context).removeClass('displayNone');
					$('button','.perboxright',$context).css('display','none');
					document.getElementById("deal").style.display = 'block';
				}
				else {
					$('#deal',$context).addClass('displayNone');
					document.getElementById("deal").style.display = 'none';
				
					$('input[name=secs]', cl).val(''+app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=mins]', cl).val(''+app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=hours]', cl).val(''+app.ext.store_bmo.u.toSt(count%24));
					count=Math.floor(count/24);
					$('input[name=days]', cl).val(''+count);    
				
					setTimeout(function(){app.ext.store_bmo_lto.u.countdown($context,prodTime);},1000);
				}
			}, //countdown
				
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