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





var bmo_product = function(_app) {
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
				_app.u.dump('BEGIN admin_orders.callbacks.init.onError');
			}
		}
	}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
			
			//reads prices for each form set by sethiddenprice tlcFormat and changes the displayed price
			//to the total for each piece selected. (price for top only if only top is selected, etc.)
			changePriceDisplayed : function($this) {
				_app.u.dump('start change function'); 
				var $parentContainer = $this.closest('form').parent();
				var everythingPrice = 0;	//will hold total cost of all items to display when no items selected
				var price = 0;	//will hold the price to display if any items are selected
					//check each form to see if an item is selected, add form cost to total if yes

				$('form',$parentContainer).each(function(){
					everythingPrice += Number($('.formPrice',$(this)).attr('data-price'));
					var count = 0;	//keeps track of whether or not form has a selection
					$('select',$(this)).each(function(){
						if($(this).val()){
							count++;
						}
					}); //select each value

					if(count != 0) {
						price += Number($('.formPrice',$(this)).attr('data-price'));
					}
				}); //each form			
					//if there is a price, an item is selected, change the displayed price to what was calculated
				if(price != 0) {
					$('.customBasePrice','.prodSummaryContainer').empty().text(_app.u.formatMoney(price,'$',2,true));
					
				} else {
						//otherwise nothing is selected, display the total cost for all pieces 
					$('.customBasePrice','.prodSummaryContainer').empty().text(_app.u.formatMoney(everythingPrice,'$',2,true));
				}
			}, //changePriceDisplayed
			
				//populates and shows list of recently viewed items in prod page popout on link click
			showRecentlyViewedItems : function($container) {
				//var $container = $('#recentlyViewedItemsContainer'); //where the list goes

					//you can only look at one list at a time
				$('.accessoriesList','.quickVModal').hide();
				$('.relatedList','.quickVModal').hide();
				$container.show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.rec','.quickVModal').addClass('selectedList');
				
					//if no recently viewed items, tell them the sky is blue
				if(_app.ext.quickstart.vars.session.recentlyViewedItems.length == 0) {
					$('.recentEmpty',$container).show();
				}
					//otherwise, show them what they've seen
				else {
					$('.recentEmpty',$container).hide();
					$('ul',$container).empty(); //empty product list;
					$($container.tlc({dataset:_app.ext.quickstart.vars.session.recentlyViewedItems,verb:"translate"})); //build product list
				}
			},
			
				//shows list of accessory_products in prod page popout on link click
			showAccessories : function() {
				//you can only look at one list at a time
				$('.recentlyViewedItemsContainer','.quickVModal').hide();
				$('.relatedList','.quickVModal').hide();
				$('.accessoriesList','.quickVModal').show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.acc','.quickVModal').addClass('selectedList');
			},
			
			showRelated : function() {
				//you can only look at one list at a time
				$('.recentlyViewedItemsContainer','.quickVModal').hide();
				$('.accessoriesList','.quickVModal').hide();
				$('.relatedList','.quickVModal').show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.comp','.quickVModal').addClass('selectedList');
			}
			
		}, //Actions

////////////////////////////////////   TLCFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//tlcFormats are what is used to actually output data.
//on a data-tlc: extension#format, format: is equal to a tlcFormat. extension: tells the rendering engine where to look for the tlcFormat.
//that way, two tlc formats named the same (but in different extensions) don't overwrite each other.
		tlcFormats : {
			
			//reads prices for both top and bottom pieces and adds them for a total preliminary price
			custombaseprice : function(data,thisTLC) {
				dump('START bmo_product#custombaseprice');
				var $tag = data.globals.tags[data.globals.focusTag];
				var pid = data.globals.binds.var;
				var displayPrice = 0;
				setTimeout(function(){
						//get price of each item from it's form, and add them for total
					var $parentContainer = $('.customATCForm',$tag.parent().parent());
					$('form',$parentContainer).each(function(){
						displayPrice += Number($('.formPrice',$(this)).attr('data-price'));
//						_app.u.dump('--> price'); _app.u.dump(displayPrice); 
					});

						//convert to money and replace original content w/ total value
					displayPrice = _app.u.formatMoney(displayPrice,'$',2,true);
					$tag.empty().text(displayPrice);
				},250);
			},
			
			loadprod : function(data,thisTLC){
				//check for matching product. No need to run this if there is no matching product to render (like for a one peice, etc.)
				var argObj = thisTLC.args2obj(data.command.args,data.globals); //this creates an object of the args
	dump('START loadprod'); dump(argObj);
				if(argObj.ismatch) {
					var $tag = data.globals.tags[data.globals.focusTag];
					var pid = data.globals.binds.var;
					var obj = {									// object to hold product id for product
						"pid" : pid,
						"withVariations":1,
						"withInventory":1
					};
						//console.debug(obj);					// see what was returned in console
					var _tag = {								// create holder for call back
						"callback":"renderMatchingProduct",		// call back function (in callbacks above)
						"extension":"store_bmo",				// extension that holds call back (this extension you're in)
						"$container" : $tag,
						"loadsTemplate" : argObj.templateid
					};
					_app.calls.appProductGet.init(obj, _tag, 'immutable');	// call appProductGet.init on the product id with the callback and callback location
					
					//execute calls
					_app.model.dispatchThis('immutable');
				}
				//just to let someone know there wasn't a matching product found 'in case' there is a problem
				else { dump('In store_bmo.renderFormats.loadprod and the matching product is undefined') }
			},
			
			//will combine features list in tab section on prod page for top and bottom products if they are both being added to the page
			combinefeatureslist : function(data,thisTLC) {
				setTimeout(function(){
					var argObj = thisTLC.args2obj(data.command.args,data.globals); //this creates an object of the args
					var prod = data.globals.binds.var;
					var $tag = data.globals.tags[data.globals.focusTag];
					dump('combinefeatureslist'); dump(argObj);
					_app.u.dump('input:'); _app.u.dump($('input[name="sku"]',$tag.parent()).val());
					var pid = $('input[name="sku"]',$tag.parent()).val(); 
					var $destination = $('.tabOfFeatures',$tag.parent().parent().parent().parent()); //append new content to container w/ default content
					
						//get the matching product's feature info
					if(typeof _app.data['appProductGet|'+pid] == 'object') {
						var pdata = _app.data['appProductGet|'+pid]
						if(pdata['%attribs'] && pdata['%attribs']['zoovy:prod_features']) {
							pdata = pdata['%attribs']['zoovy:prod_features'];
							
								//create DOM element for wiki parser, then add new content to page and remove temp element from DOM
								//most of this part from "wiki :" in controller
							var $tmp = $('<div \/>').attr('id','TEMP_'+$tag.attr('data-bmo-combine')).hide().appendTo('body');
							var target = document.getElementById('TEMP_'+$tag.attr('data-bmo-combine')); //### creole parser doesn't like dealing w/ a jquery object. fix at some point.
							//myCreole.parse(target, pdata,{},data.bindData.wikiFormats); //removing the data.bindData reference here seemed to work, but may have unknown consequenses... 
							myCreole.parse(target, pdata,{});
							$destination.append($("<div class='clear'></div>"));
							$destination.append($tmp.html());
							$tmp.empty().remove();
						}
						else {_app.u.dump('%attribs or zoovy:prod_features were not set for '+pid);}
					}else {_app.u.dump('appProductGet for '+pid+' did not return as an object');}
				},500);
			}, //combinefeatureslist
			
			matchatcformpid : function(data,thisTLC) {
				var pid = data.globals.binds.var;
				var $tag = data.globals.tags[data.globals.focusTag];
				if(typeof _app.data['appProductGet|'+pid] == 'object') {
					var pdata = _app.data['appProductGet|'+pid]['%attribs'];
					if(_app.u.isSet(pdata['user:matching_piece'])){
						var matchData = pdata['user:matching_piece'];
					}
				}
				$tag.append("<input type='hidden' name='sku' value='"+matchData+"' data-match='"+matchData+"' />");
			},
			
		}, //tlcFormats
			
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
			
			//gets and adds pricing for top & bottom pieces to hidden element, which are then read onChange of form select list
			//by changePriceDisplayed util function to alter the displayed price according to the selected pieces.
			setHiddenPrice : function(infoObj,$context,attempts) {
				attempts = attempts || 0;
//				dump("setHiddenPrice infoObj:"); dump(_app.data["appProductGet|"+infoObj.pid]['%attribs']);
				var prodGet = _app.data["appProductGet|"+infoObj.pid];
				if(prodGet && prodGet['%attribs'] && prodGet['%attribs']['user:matching_piece']) {
//					dump('THIS ITEM HAS A MATCHING PIECE.');
					var $parentContainer = $('.customATCForm',$context);
					var displayPrice = 0;
					$('form',$parentContainer).each(function(){
						var pid = _app.u.makeSafeHTMLId($('input[name="sku"]',$(this)).val());
						var prod = _app.data['appProductGet|'+pid];
						if(prod !== undefined) {
							//var formDesignator = $('.formPrice',$(this)).attr('data-formDesig');
							//var $summaryContainer = $('.prodSummaryContainer',$context);
							if(prod && prod['%attribs'] && prod['%attribs']['zoovy:base_price']) {
								var hiddenPrice = _app.ext.store_bmo.u.applyLTODiscount(pid,prod['%attribs']['zoovy:base_price']);
								$('.formPrice',$(this)).attr('data-price',hiddenPrice); 
								displayPrice += Number(hiddenPrice);
							}
							else {_app.u.dump('!! _app.ext.bmo_product.renderformats.sethiddenprice() failed !!'); }
						}
						else { setTimeout(function(){ _app.ext.bmo_product.u.setHiddenPrice(infoObj,$context,attempts+1) },250); }
					});
					displayPrice = _app.u.formatMoney(displayPrice,'$',2,true);
					$('.customBasePrice',$context).empty().text(displayPrice);
				}
				else { 
					//dump('Not a matching item move along, nothing to see here.');/* This is a one peice (or other non-matching item) and doesn't need special price display handling */ 
				} 
			}, //setHiddenPrice
			
			addRecentlyViewedItems : function(page) {
				dump(page);
				//if this is run for the modal, get the pid from an element there, for the inline page the pid is passed explicitly. 
				var pid = page === "modal" ? _app.u.makeSafeHTMLId($('.popupshado','.quickVModal').attr('data-pid')) : page;
 				_app.u.dump('bmo_product recentlyViewedItems has been run');
				dump(pid);
				//add item to session var
				if($.inArray(pid,_app.ext.quickstart.vars.session.recentlyViewedItems) < 0)	{
					_app.ext.quickstart.vars.session.recentlyViewedItems.unshift(pid);
				}
				else	{
					//the item is already in the list. move it to the front.
					_app.ext.quickstart.vars.session.recentlyViewedItems.splice(0, 0, _app.ext.quickstart.vars.session.recentlyViewedItems.splice(_app.ext.quickstart.vars.session.recentlyViewedItems.indexOf(pid), 1)[0]);
				}
//				_app.u.dump(_app.ext.quickstart.vars.session); _app.u.dump('modal pid:'); _app.u.dump(pid);
			} //addRecentlyViewedItems
			
		}, //u [utilities]
			
////////////////////////////////////   EVENT [e]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\			

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			
			//opens items from prod page pop out into modal, also adds them to recently viewed session var
			optionsquickview : function($ele,p) {
				p.preventDefault();
				var pid = $ele.attr('data-pid');
				var $modal = $('.popupshado','.quickVModal');
				var $product = $('.prodViewerContainer','.quickVModal');
				var sourcePID = _app.u.makeSafeHTMLId($modal.attr('data-pid'));
				
				_app.ext.bmo_product.u.addRecentlyViewedItems("modal");	//record modal item as viewed (because modal isn't actually closed)
				$ele.attr('data-source-pid',sourcePID); //add data element for hideMoreOptions function to read
				_app.ext.bmo_product.e.hideMoreOptions($ele,p); //close pop out

				$product.animate({'opacity':'0'},550);	//make removal of shown product pretty
				setTimeout(function(){quickView('product',{'templateID':'productTemplateQuickView','pid':pid});},550);	//open new product
				return false;
			},
			
			//closes and fades out the slide out tab in quickview modal
			hideMoreOptions : function($ele, p) {
				p.preventDefault();
				var _pid = $ele.attr('data-source-pid');
				
				$('.anotherElement_'+_pid).animate({'width':'0px'},500, function() { $(this).hide(); });
				$('.quickVModal').animate({'margin':'0 50%','left'	:'-360px',},500,function() {
					$('.myelement','.quickVModal').show().css('opacity','0').animate({'opacity':'1'},500);
				});
				setTimeout(function(){
					$('.quickVModal').removeClass('anotherElement');
					$('.anotherElement_'+_pid).removeClass('anotherElement');
				},1000);
				return false;
			},
			
			//shows modal which contains form to e-mail current page to someone (see emailfriend)
			showemailfriend : function($ele,p) { dump('show email');
				p.preventDefault();
				//find element in index and stick template in it to create dialog from (so template doesn't have to reside in index).
				var $parent = $("[data-email='friend']");
				$parent.empty().tlc({verb:"transmogrify", templateid:"emailAFriendTemplate"});
				
				var pid = $ele.attr('data-pid');
//				dump('--start showemailfriend'); dump(pid); dump($parent);
				$parent.dialog({
					'modal':'true', 'title':'Tell a Friend','width':'60%', 'max-height':300,'dialogClass':'emailDialog',
					'open' : function(event, ui) { 
						$("span",$parent).attr("data-pid",pid);
						$('[data-close="email"]','.emailDialog').on('click.closeModal', function(){$parent.dialog('close')});
						//$('.ui-widget-overlay').on('click.closeModal', function(){$parent.dialog('close')});
					},
					'close': function(event, ui){ 
						//$('.ui-widget-overlay').off('click.closeModal');
						$("span",$parent).attr("data-pid","");
					}
				});
				//$(".ui-dialog-titlebar").hide();
			},
			
			//sends e-mail to recipient. TODO : Test output / Make a link of the pid to show in the e-mail. 
			emailfriend : function($form, p) {
				p.preventDefault();
				dump('-----start emailfriend...');
				var sender = $('input[name="youremail"]',$form).val();
				var recipient = $('input[name="theiremail"]',$form).val();
				var pid = $("span",$form).attr("data-pid");
				dump('emailfriend sender, & pid:'); dump(recipient);  dump(pid);
				var params = {
					'product' 	: pid,
					'recipient'	: recipient,
					'sender'		: sender,
					'method'	: 'tellafriend',
					'_cmd'		: 'appEmailSend',
					'_tag'		: {
						'callback':function(rd){
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								dump('emailfriend callback...'); dump(rd); 
								$form.anymessage(_app.u.successMsgObject("You've sent an e-mail to "+recipient+" successfully!"));
							}
						}
					}
				};
				_app.model.addDispatchToQ(params,'immutable');
				_app.model.dispatchThis('immutable');
			},
			
			addToCart : function($ele, p) {
//				_app.u.dump('-> START bmo_product addToCart');
				p.preventDefault();
				_app.require(['store_product','cco','templates.html'],function() {
					var numCalls = 0;
					var thisCartID = "";
					$('form', $ele.parent()).each(function(){
	//					dump('THIS form element:'); _app.u.dump($(this));
						var id = $('.zwarn',$(this)).attr('id').split('_'); //get pid from id added render options
						var pid = id[1]; 		//break pid out of id
						var $form = $(this); 	//holder for the current form
						
						$(this).data('skipvalidation', true); //don't use native app validation
						//the buildCartItemAppendObj needs a _cartid param in the form (we'll use this way at the bottom too).
						if($("input[name='_cartid']",$form).length) {}
						else { $form.append("<input type='hidden' name='_cartid' value='"+_app.model.fetchCartID()+"' \/>"); }
						var cartObj = _app.ext.store_product.u.buildCartItemAppendObj($(this)); //build cart object
						var valid = true; //check this to ensure options selected

						//validate
						if(pid && $form)	{
							//copied locally for quick reference.
							var sogJSON = _app.data['appProductGet|'+pid]['@variations'],
							formJSON = $form.serializeJSON();
							console.debug($form.serializeJSON()); 
	//						_app.u.dump('BEGIN validate_pogs. Formid ='+formId);
						
							if($.isEmptyObject(sogJSON)) {
	//							_app.u.dump('no sogs present (or empty object)'); //valid. product may not have sogs.
							}
							else if($.isEmptyObject(formJSON)) {
								_app.u.throwGMessage("In store_product.validate.addToCart, formJSON is empty.");
							} //this shouldn't be empty. if it is, likely $form not valid or on DOM.
							else	{
	//							_app.u.dump(" -> everything is accounted for. Start validating.");	
								$('.appMessage',$form).empty().remove(); //clear all existing errors/messages.
							
								var thisSTID = pid, //used to compose the STID for inventory lookup.
								inventorySogPrompts = '',//the prompts for sogs with inventory. used to report inventory messaging if inventory checks are performed
								errors = '', pogid, pogType;
	//							_app.u.dump(" -> formJSON: "); _app.u.dump(formJSON);

								//No work to do if there are no sogs. 
								if(sogJSON)	{
	//								_app.u.dump('got into the pogs-are-present validation');
									for(var i = 0; i < sogJSON.length; i++)	{
										pogid = sogJSON[i]['id']; //the id is used multiple times so a var is created to reduce number of lookups needed.
										pogType = sogJSON[i]['type']; //the type is used multiple times so a var is created to reduce number of lookups needed.
							
										if(sogJSON[i]['optional'] == 1) {
											//if the pog is optional, validation isn't needed.			
										}
										else if (pogType == 'attribs' || pogType == 'hidden' || pogType == 'readonly' || pogType == 'cb') {
											//these types don't require validation.
										}
										//Okay, validate what's left.
										else {
										//If the option IS required (not set to optional) AND the option value is blank, AND the option type is not attribs (finder) record an error
											if(formJSON[pogid]){}
											else {
												valid = false;
												//maybe for later versions to specify exactly what isn't selected
												//errors += "<li>"+sogJSON[i]['prompt']+"<!--  id: "+pogid+" --><\/li>";
											}
										}
										
										//compose the STID
										if(sogJSON[i]['inv'] == 1) {
											thisSTID += ':'+pogid+formJSON[pogid];
											inventorySogPrompts += "<li>"+sogJSON[i]['prompt']+"<\/li>";
										}
									}
								}				
	//							_app.u.dump('past validation, before inventory validation. valid = '+valid);
				/*				//if errors occured, report them.
								 if(valid == false) {
	//								_app.u.dump(errors);
									var errObj = _app.u.youErrObject("Uh oh! Looks like you left something out. Please make the following selection(s):<ul>"+errors+"<\/ul>",'42');
									errObj.parentID = 'JSONpogErrors_'+pid
									_app.u.throwMessage(errObj);
								}
				*/				//if all options are selected AND checkinventory is on, do inventory check.
								//else 
								if(valid == true && typeof zGlobals == 'object' && zGlobals.globalSettings.inv_mode > 1)	{
	//								alert(thisSTID);
									if(!$.isEmptyObject(_app.data['appProductGet|'+pid]['@inventory']) && !$.isEmptyObject(_app.data['appProductGet|'+pid]['@inventory'][thisSTID]) && _app.data['appProductGet|'+pid]['@inventory'][thisSTID]['inv'] < 1)	{
										var errObj = _app.u.youErrObject("We're sorry, but the combination of selections you've made is not available. Try changing one of the following:<ul>"+inventorySogPrompts+"<\/ul>",'42');
										errObj.parentID = 'JSONpogErrors_'+pid
										_app.u.throwMessage(errObj);
										valid = false;
									}
								}
							}
						} //validation

						if(valid){
							numCalls++;
							thisCartID = cartObj._cartid;
							//cartMessagePush(cartObj._cartid,'cart.itemAppend',_app.u.getWhitelistedObject(cartObj,['sku','pid','qty','quantity','%variations']));
							_app.ext.cco.calls.cartItemAppend.init(cartObj,{},'immutable');	
						} 
					}); // form processing
					if(numCalls > 0) {
						_app.model.destroy('cartDetail|'+thisCartID);
						_app.calls.cartDetail.init(thisCartID,{'callback':function(rd){
							if(_app.model.responseHasErrors(rd)){ $('#globalMessaging').anymessage({'message':rd}); }
							else {
								if($ele.data('show') == 'inline') { document.location.hash = "#!cart"; }
								else { _app.ext.quickstart.u.showCartInModal({'templateID':'cartTemplate'}); }
							}
						}},'immutable');
						_app.model.dispatchThis('immutable');
					} else {
						//Notify user of problem
						$('.atcPogErrors', $ele.parent()).anymessage(_app.u.youErrObject("You must select variations for at least one product!",'#'));
					}
				}); //end require
				return false;
			}, // addToCart
			
		}, //e [app Events]
			
	} //r object.
	return r;
}
