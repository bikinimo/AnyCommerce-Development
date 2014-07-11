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


var store_bmo_lto = function(_app) {
	var theseTemplates = new Array('');
	var r = {
	
		vars : {
			defaultlto : 0
		},

	
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
				_app.u.dump('BEGIN _app.ext.stor_bmo_lto.callbacks.init.onError');
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
		
			//same as regular money function but checks if product is an LTO and applies discount to displayed price if so (just for display)
			ltomoney : function($tag,data)	{
//			_app.u.dump('BEGIN ltomoney');
			var amount = data.bindData.iselastic ? (data.value / 100) : data.value;
			if(!$tag.attr('data-nodiscount') == 1) {
				amount = _app.ext.store_bmo_lto.u.applyLTODiscount($tag.parent().attr('data-pid'),amount);
			}	
			if(amount)	{
//				dump($tag.attr('data-currecny')); dump($tag.attr('data-hide-zero'));
				var r,o,sr;
				r = _app.u.formatMoney(amount,$tag.attr('data-currecny'),'',$tag.attr('data-hide-zero'));
//					_app.u.dump(' -> attempting to use var. value: '+data.value);
//					_app.u.dump(' -> currencySign = "'+data.bindData.currencySign+'"');
				var preText = $tag.attr('data-pretext') ? $tag.attr('data-pretext')+" " : ""; 

				//if the value is greater than .99 AND has a decimal, put the 'change' into a span to allow for styling.
				if(r.indexOf('.') > 0)	{
//					_app.u.dump(' -> r = '+r);
					sr = r.split('.');
					o = sr[0];
					o = preText + o;
					if(sr[1])	{o += '<span class="cents">.'+sr[1]+'<\/span>'}
					$tag.html(o);
					}
				else	{
					$tag.html(preText + r);
					}
				}
			}, //money
		
				//adds a class to $tag parent for css style changes to LTO cart/checkout items
			hidestufflistlto : function($tag, data) {
				if(data.value == '%LTO10' || data.value == '%LTO15' || data.value == '%LTO20' || data.value == '%LTO25') {
					$tag.parent().addClass('ltoItem');
				}
			},
		
				//checks each item in the cart and adds correct coupon for item's LTO discount if it is the current LTO
			addcouponlto : function($tag, data) {
				var products = [];
					for(var index in data.value) {
						if(data.value[index].product[0] != '%') {
							products.push(data.value[index].product);
						}
					}
//					_app.u.dump('--> LTO addCouponLTO'); _app.u.dump(products);
					var numRequests = 0;
					for(var index in products) {
						var _tag = {
							'callback':function(rd) {
								if(_app.model.responseHasErrors(rd)) {
									_app.u.throwMessage(rd);
								}
								else {
									var prod = _app.data[rd.datapointer];
									if(prod['%attribs'] && prod['%attribs']['user:limited_time_offer'] && prod['%attribs']['zoovy:prod_promoclass']) {
										if(_app.ext.store_bmo_lto.u.isTheLTO(prod['%attribs']['user:limited_time_offer'])) {
											var discount = _app.ext.store_bmo_lto.u.qtyOfDiscountLTO(prod['%attribs']);
//												_app.u.dump('LTO'+discount);
											if(discount) {
												discount = 'LTO'+discount;
													//add the discount to the cart. 
												_app.ext.cco.calls.cartCouponAdd.init(discount,{'callback':function(rd) {
													if(_app.model.responseHasErrors(rd)) {
														$('#cartMessaging').anymessage({'message':rd})
													}
													else {
														//_app.ext.orderCreate.u.handlePanel($('#cartTemplateForm'),'chkoutCartItemsList',['empty','translate','handleDisplayLogic','handleAppEvents']);
													}
												}});
												_app.model.dispatchThis('immutable');
											}
											else {} //discount is 0, no coupon to add.
										}
										else {} //this item's LTO range doesn't include "now."
									}
									else {} //not an LTO item, no need to do any processing.
								}
							}
						};
						numRequests += _app.ext.store_prodlist.calls.appProductGet.init({'pid':products[index]},_tag,'immutable');
					}
					if(numRequests > 0){_app.model.dispatchThis('immutable');}
			}, //addCouponLTO
				
				//gets last item in $limited-time-offer and sets a data attribute w/ its pid to be read in countdownCheck().
			defaultlto : function($tag,data) {
				$tag.attr('data-default-lto',data.value[data.value.length - 1]);
			},
		
				//shows "regular price" in product listing if the product is the current LTO item.
			islto : function($tag, data) {
				if(data.value) {
				if(_app.ext.store_bmo_lto.u.isTheLTO(data.value)) {
					$tag.show(); //the product is the limited time offer item for now, show it.
				}
				else {} //is not yet or already past it's limited time offer status, hidden by default so do nada.
				}
			},
			
				//checks promo end date/time against current date/time. Deletes item to show next if promo is over,
				//calls countdown() to show timer on item if promo isn't over.
			countdowncheck : function($tag, data) {
				var defaultLTO = $('[data-default-lto]','.homeTemplate').attr('data-default-lto');
				var prod = data.value['%attribs'];
				var pid = _app.u.makeSafeHTMLId(data.value.pid);
				if(prod && prod['user:limited_time_offer']) {
					var prodStartTime = prod['user:limited_time_offer'].split('.')[0];
					var prodEndTime = prod['user:limited_time_offer'].split('.')[1];
					
					if(prodEndTime){		
				//		var d = new Date(_app.ext.store_bmo.u.makeUTCFloridaTimeMS());
						var d = new Date(_app.ext.store_bmo.u.makeUTCTimeMS());
						var nowTime = _app.ext.store_bmo.u.millisecondsToYYYYMMDDHH(d); //current UTC time	
							//all offers are past, so show the last item w/ "this offer over" message by passing the expired date to countdown.
						if (prodEndTime < nowTime && pid == defaultLTO) {
							_app.u.dump('All limited time offers have passed, list needs repopulating');
							_app.ext.store_bmo_lto.u.countdown($tag.parent(),prodEndTime);
						}
							//check if end of promotion has been reached, remove if it has.
						else if(prodEndTime < nowTime) {
							_app.u.dump('!! LTO date for '+pid+' has ended. Remove or edit product record.'); 
							$tag.parent().remove();
						}	//check if promotion has not started yet, remove if not
						else if(prodStartTime > nowTime) {
							_app.u.dump('LTO date for '+pid+' has not occured yet.'); 
							$tag.parent().remove();
						}
						else {
								//promotion is still good load countdown with it
							_app.ext.store_bmo_lto.u.countdown($tag.parent(),prodEndTime);
						}
					}
					else {
						$tag.parent().remove();
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
			
				//checks the coupon field in checkout for entry of an LTO coupon. If it is, returns true to reject the entry in orderCreate:execCouponAdd.
			preventCouponLTO : function(input) {
				var r = false; //what is returned, true if coupon is LTO
				input = input.toUpperCase();
				if(input == 'LTO10' || input == 'LTO15' || input == 'LTO20' || input == 'LTO25') {
					r = true;
				}
				return r;
			},
		
				//checks the discount attrib assigned and returns a value to be used for the percentage discount.
			qtyOfDiscountLTO : function(prod) {
			_app.u.dump('--> Promoclass:'); _app.u.dump(prod['zoovy:prod_promoclass']);
				var discount = false; //what is returned, level of discount or false if no discount
				switch(prod['zoovy:prod_promoclass']) {
					case '10': discount = '10';	break;
					case '15': discount = '15';	break;
					case '20': discount = '20';	break;
					case '25': discount = '25';	break;
				}
				return discount;
			},
		
				//checks to see if item's LTO time falls into the current time, returns true if so.
			isTheLTO : function(limited_time_offer) {
				var r = false;
				var ltoStartTime = limited_time_offer.split('.')[0];
				var ltoEndTime = limited_time_offer.split('.')[1];
				var d = new Date(_app.ext.store_bmo.u.makeUTCTimeMS());
				var nowTime = _app.ext.store_bmo.u.millisecondsToYYYYMMDDHH(d);
				
				if(ltoStartTime && ltoEndTime && ltoStartTime < nowTime && ltoEndTime > nowTime) {
					r = true; //the product is the limited time offer item for now.
				}
				else {}  //is not yet or already past it's limited time offer status.
				
				return r;
			},
		
				//applies LTO discount to product price if it has one, and 
			applyLTODiscount : function(pid, amount) {
				if(pid) {
					pid = _app.u.makeSafeHTMLId(pid);
					var prod = _app.data['appProductGet|'+pid];
					var discount = 0; //if no discount, multiply by 0 will keep price the same
				
						//if the product has a limited time offer and any discount the displayed price needs to be changed
					if(prod && prod['%attribs'] && prod['%attribs']['user:limited_time_offer'] && prod['%attribs']['zoovy:prod_promoclass']) {
						prod = prod['%attribs'];
						if(_app.ext.store_bmo_lto.u.isTheLTO(prod['user:limited_time_offer'])) {
							discount = _app.ext.store_bmo_lto.u.qtyOfDiscountLTO(prod) * 0.01;
						}
					} //end discount if

					amount = amount - (amount * discount);
				}
				
				return amount;
			},
		
				//runs countdown timer against current time and passed argument of product lto end time
			countdown : function($context, prodTime) {
				var endTime = new Date(_app.ext.store_bmo.u.yyyymmdd2Pretty(prodTime));
//				_app.u.dump('End Time is: '); _app.u.dump(endTime.getTime());
				var cl = $('form[name="clock"]', $context);
		//		var count=Math.floor((endTime.getTime()-_app.ext.store_bmo.u.makeUTCFloridaTimeMS())/1000);
				var count=Math.floor((endTime.getTime()-_app.ext.store_bmo.u.makeUTCTimeMS())/1000);
				
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
				
					$('input[name=secs]', cl).val(''+_app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=mins]', cl).val(''+_app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=hours]', cl).val(''+_app.ext.store_bmo.u.toSt(count%24));
					count=Math.floor(count/24);
					$('input[name=days]', cl).val(''+count);    
				
					setTimeout(function(){_app.ext.store_bmo_lto.u.countdown($context,prodTime);},1000);
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