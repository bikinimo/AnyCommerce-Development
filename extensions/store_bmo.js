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



//    !!! ->   TODO: replace 'username' in the line below with the merchants username.     <- !!!

var store_bmo = function() {
	var theseTemplates = new Array('');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	vars : { 
		//eventdate : new Date("november 6, 2013 15:48:59")
		//eventdate : "2013110615" //YYYYMMDDHH format
		eventdate : "9999999999" //YYYYMMDDHH format
	},

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				app.ext.store_bmo.u.bindOnclick();
				
				app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj) {
					var $context = $(app.u.jqSelector('#'+infoObj.parentID));
			//		if(!$context.data('countingdown')) {
			//			app.ext.store_bmo.u.countdown($context);
			//			$context.data('countingdown',true);	
			//		}
					app.ext.store_bmo.u.runHomeCarouselTab1($context);
					app.ext.store_bmo.u.runHomeCarouselTab2($context);
					app.ext.store_bmo.u.runHomeCarouselTab3($context);
					app.ext.store_bmo.u.runHomeCarouselTab4($context);
					
					if(!$context.data('tab4Templated')){
						app.ext.store_bmo.u.loadProductsAsList('.app-categories.accessories');
						$context.data('tab4Templated',true);
					}
				}]);

				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;

				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			},
			
			startExtension : {
				onSuccess : function() {
					if(app.ext.myRIA && app.ext.myRIA.template){
						app.u.dump("store_bmo Extension Started");
						$.extend(handlePogs.prototype,app.ext.store_bmo.variations);
						app.u.dump('*** Extending Pogs');
					} else	{
						setTimeout(function(){app.ext.store_bmo.callbacks.startExtension.onSuccess()},250);
					}
				},
				onError : function (){
					app.u.dump('BEGIN app.ext.store_bmo.callbacks.startExtension.onError');
				}
			},
			
			renderMatchingProduct : {
				// call function with the data response passed as argument 
				// (dataresponse is returned from the model when the API request returns, 
				// generaly just a repeat of _tag object you passed, but contains error response durring an error)
				onSuccess:function(responseData){	
					app.u.dump(' -> renderMatchingProduct');
					// call anycontent (from anyplugins) on class to put content in ** '.match_'+app.data[responseData.datapointer].pid) **, 
					//using the template you want to render with ** "matchingProductTemplate" **, using a pointr to the data that was returned ** "datapointer":responseData.datapointer **. 
					//app.u.dump('ResponseData pointer'); app.u.dump(responseData.datapointer);// app.u.dump($('.prodViewerAddToCartForm ','.match_'+app.data[responseData.datapointer].pid));
					//$('.match_'+app.data[responseData.datapointer].pid).anycontent({"templateID":"matchingProductTemplate","datapointer":responseData.datapointer}); 
					responseData.$container.anycontent({"templateID":responseData.loadsTemplate,"datapointer":responseData.datapointer}); 
				},
				onError:function(responseData){	
					app.u.dump('Error in extension: store_bmo renderMatchingProduct'); // error response goes here if needed
				}
			},
			
			rendermatchingBasePrice : {
				onSuccess : function(rd) {
					var dataObj = {};
					var matchPrice = app.data[rd.datapointer]['%attribs']['zoovy:base_price'];
					var origPrice = rd.price;
					
					if(app.data[rd.datapointer]['%attribs']['user:limited_time_offer']) {
						dataObj.lto = app.data[rd.datapointer]['%attribs']['user:limited_time_offer'];
					}
					
					dataObj.combinedTotal = Number(origPrice) + Number(matchPrice);
					dataObj.pid = app.u.makeSafeHTMLId(rd.datapointer.split('|')[1]);
					rd.$container.anycontent({"templateID":rd.loadsTemplate,"data":dataObj});
//					app.u.dump('--> response data:'); app.u.dump(rd);
//					app.u.dump('--> the matching price:'); app.u.dump(matchPrice); 
//					app.u.dump('--> the original price:'); app.u.dump(origPrice); 
//					app.u.dump('--> the final price:'); app.u.dump(dataObj.combinedTotal); 
				},
				onError : function(rd) {
					app.u.dump('Error in extenstion: store_bmo rendermatchingBasePrice. Response data follows:'); app.u.dump(rd);
				}
			}, //rendermatchingBasePrice
			
			renderProductsAsList : {
				onSuccess : function(responseData) {
			//		app.u.dump(app.data[responseData.datapointer]);
					$('#carCat6','.homeTemplate').anycontent({"templateID":"tab4Template","datapointer":responseData.datapointer});
				},
				onError : function(responseData){
					app.u.dump('Error in extension: store_bmo_ renderProductsAsList');
					app.u.dump(responseData);
				}
			}
			
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
		
				//pass a class or id name, a string "class" for type if it's a class, any other for an id, and the parent tag as a $object
			scrollTo : function(name, type, $parent) {
				var type = type == 'class' ? '.' : '#'; //is the element a class or an id
					
				$('html,body').animate({ scrollTop: $(type + name,$parent).offset().top }, 'slow'); //scroll to it
			},
		
				//reads prices for each form set by setHiddenPrice renderFormat and changes the displayed price
				//to the total for each piece selected. (price for top only if only top is selected, etc.)
			changePriceDisplayed : function() {
//				app.u.dump('start change function'); 

				var everythingPrice = 0;	//will hold total cost of all items to display when no items selected
				var price = 0;	//will hold the price to display if any items are selected
					//check each form to see if an item is selected, add form cost to total if yes
				$('form','.customATCForm').each(function(){
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
					$('.customBasePrice','.prodSummaryContainer').empty().text(app.u.formatMoney(price,'$',2,true));
					
				} else {
						//otherwise nothing is selected, display the total cost for all pieces 
					$('.customBasePrice','.prodSummaryContainer').empty().text(app.u.formatMoney(everythingPrice,'$',2,true));
				}
			}, //changePriceDisplayed
			
				//opens items from prod page pop out into modal, also adds them to recently viewed session var
			optionsQuickView : function($this, pid) {
				var $modal = $('.popupshado','.quickVModal');
				var $product = $('.prodViewerContainer','.quickVModal');
				var sourcePID = app.u.makeSafeHTMLId($modal.attr('data-pid'));
				
				app.ext.store_bmo.u.addRecentlyViewedItems();	//record pop out item as viewed
				app.ext.store_bmo.a.hideMoreOptions($this, sourcePID);	//close pop out

				$product.animate({'opacity':'0'},550);	//make removal of shown product pretty
				setTimeout(function(){quickView('product',{'templateID':'productTemplateQuickView','pid':pid});},550);	//open new product
			},
		
				//populates and shows list of recently viewed items in prod page popout on link click
			showRecentlyViewedItems : function() {
				var $container = $('#recentlyViewedItemsContainer'); //where the list goes

					//you can only look at one list at a time
				$('.accessoriesList','.quickVModal').hide();
				$('.relatedList','.quickVModal').hide();
				$container.show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.rec','.quickVModal').addClass('selectedList');
				
					//if no recently viewed items, tell them the sky is blue
				if(app.ext.myRIA.vars.session.recentlyViewedItems.length == 0) {
					$('.recentEmpty',$container).show();
				}
					//otherwise, show them what they've seen
				else {
					$('.recentEmpty',$container).hide();
					$('ul',$container).empty(); //empty product list;
					$($container.anycontent({data:app.ext.myRIA.vars.session})); //build product list
				}
			},
			
				//shows list of accessory_products in prod page popout on link click
			showAccessories : function() {
			
					//you can only look at one list at a time
				$('#recentlyViewedItemsContainer','.quickVModal').hide();
				$('.relatedList','.quickVModal').hide();
				$('.accessoriesList','.quickVModal').show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.acc','.quickVModal').addClass('selectedList');
			},
			
			showRelated : function() {
			
					//you can only look at one list at a time
				$('#recentlyViewedItemsContainer','.quickVModal').hide();
				$('.accessoriesList','.quickVModal').hide();
				$('.relatedList','.quickVModal').show();
				$('.comparissonsbox ul li','.quickVModal').removeClass('selectedList');
				$('.comp','.quickVModal').addClass('selectedList');
			},
		
			justText : function() {
				return $(this).clone().children().remove().end().text();
			},
			
			handleLocalStorage : function() {
				if(localStorage.appPreferences == 'signedUp') { //user has an account lets keep that info intact
				localStorage.clear(); //clear everything from localStorage.
				localStorage.appPreferences = 'signedUp'; //add indication that user has account back into localStorage
				}
				else { //no indication that user has account kill'em all
					localStorage.clear(); //clear everything from localStorage.
				}
			},
		
			addToCart : function($this) {
				//app.u.dump('-> store_bmo addToCart');
	
				var numCalls = 0;
				$('form', $this).each(function(){
					//app.u.dump($(this));
					var id = $('.zwarn',$(this)).attr('id').split('_'); //get pid from id added render options
					var pid = id[1]; 		//break pid out of id
					var $form = $(this); 	//holder for the current form
					
					$(this).data('skipvalidation', true); //don't use native app validation
					var cartObj = app.ext.store_product.u.buildCartItemAppendObj($(this)); //build cart object 
					var valid = true; //check this to ensure options selected

					//validate
					if(pid && $form)	{
						//copied locally for quick reference.
						var sogJSON = app.data['appProductGet|'+pid]['@variations'],
						formJSON = $form.serializeJSON();
						console.debug($form.serializeJSON());
						
					//	app.u.dump('BEGIN validate_pogs. Formid ='+formId);
					
						if($.isEmptyObject(sogJSON))	{
							app.u.dump('no sogs present (or empty object)'); //valid. product may not have sogs.
							}
						else if($.isEmptyObject(formJSON))	{
				//			app.u.throwGMessage("In store_product.validate.addToCart, formJSON is empty.");
							} //this shouldn't be empty. if it is, likely $form not valid or on DOM.
						else	{
							app.u.dump(" -> everything is accounted for. Start validating.");	
							$('.appMessage',$form).empty().remove(); //clear all existing errors/messages.
						
							var thisSTID = pid, //used to compose the STID for inventory lookup.
							inventorySogPrompts = '',//the prompts for sogs with inventory. used to report inventory messaging if inventory checks are performed
							errors = '', pogid, pogType;
							
				//			app.u.dump(" -> formJSON: "); app.u.dump(formJSON);
							
				//No work to do if there are no sogs. 
							if(sogJSON)	{
					//			app.u.dump('got into the pogs-are-present validation');
								for(var i = 0; i < sogJSON.length; i++)	{
									pogid = sogJSON[i]['id']; //the id is used multiple times so a var is created to reduce number of lookups needed.
									pogType = sogJSON[i]['type']; //the type is used multiple times so a var is created to reduce number of lookups needed.
						
									if(sogJSON[i]['optional'] == 1)	{
										//if the pog is optional, validation isn't needed.			
										}
									else if (pogType == 'attribs' || pogType == 'hidden' || pogType == 'readonly' || pogType == 'cb'){
										//these types don't require validation.
										}
						//Okay, validate what's left.
									else	{
						//If the option IS required (not set to optional) AND the option value is blank, AND the option type is not attribs (finder) record an error
										if(formJSON[pogid]){}
										else	{
											valid = false;
											//maybe for later versions to specify exactly what isn't selected
											//errors += "<li>"+sogJSON[i]['prompt']+"<!--  id: "+pogid+" --><\/li>";
											}
										}
									
									//compose the STID
									if(sogJSON[i]['inv'] == 1)	{
										thisSTID += ':'+pogid+formJSON[pogid];
										inventorySogPrompts += "<li>"+sogJSON[i]['prompt']+"<\/li>";
										}
									
									}
								}
					
/****************/					
					//		app.u.dump('past validation, before inventory validation. valid = '+valid);
		/*				
						//if errors occured, report them.
							 if(valid == false)	{
					//			app.u.dump(errors);
								var errObj = app.u.youErrObject("Uh oh! Looks like you left something out. Please make the following selection(s):<ul>"+errors+"<\/ul>",'42');
								errObj.parentID = 'JSONpogErrors_'+pid
								app.u.throwMessage(errObj);
								}
		*/				//if all options are selected AND checkinventory is on, do inventory check.
							//else 
							if(valid == true && typeof zGlobals == 'object' && zGlobals.globalSettings.inv_mode > 1)	{
						//		alert(thisSTID);
								if(!$.isEmptyObject(app.data['appProductGet|'+pid]['@inventory']) && !$.isEmptyObject(app.data['appProductGet|'+pid]['@inventory'][thisSTID]) && app.data['appProductGet|'+pid]['@inventory'][thisSTID]['inv'] < 1)	{
									var errObj = app.u.youErrObject("We're sorry, but the combination of selections you've made is not available. Try changing one of the following:<ul>"+inventorySogPrompts+"<\/ul>",'42');
									errObj.parentID = 'JSONpogErrors_'+pid
									app.u.throwMessage(errObj);
									valid = false;
									}
						
								}
							}
						} //validation
					
					
					if(valid){ 
						numCalls++;
						app.calls.cartItemAppend.init(cartObj,{},'immutable');	
					} 
				}); // form processing
				if(numCalls > 0){
					app.model.destroy('cartDetail');
					app.calls.cartDetail.init({'callback':function(rd){
						showContent('cart',{});
						}},'immutable');
					app.model.dispatchThis('immutable');
				} else {
					//Notify user of problem
					$('.atcPogErrors', $this).anymessage(app.u.youErrObject("You must select variations for at least one product!",'#'));
					
				}
			}, // addToCart
		
			//allow only numbers in a form field, plus . ( ) -
			checkForInt : function(evt) {
				evt = ( evt ) ? evt : window.event;
				var charCode = ( evt.which ) ? evt.which : evt.keyCode
				return (charCode == 45 || charCode == 46 || charCode == 40 || charCode == 41 || charCode <= 31 || (charCode >= 48 && charCode <= 57))
			},
		
			//copied from app-quickstart.js so additional parameter could be used to assign the error location (for diff. login screens)
			loginFrmSubmit : function(email,password,errorDiv)	{
				var errors = '';
				$errorDiv = errorDiv.empty(); //make sure error screen is empty. do not hide or callback errors won't show up.

				if(app.u.isValidEmail(email) == false){
					errors += "Please provide a valid email address<br \/>";
					}
				if(!password)	{
					errors += "Please provide your password<br \/>";
					}
				if(errors == ''){
					app.calls.appBuyerLogin.init({"login":email,"password":password},{'callback':'authenticateBuyer','extension':'myRIA'});
					app.calls.refreshCart.init({},'immutable'); //cart needs to be updated as part of authentication process.
//					app.calls.buyerProductLists.init('forgetme',{'callback':'handleForgetmeList','extension':'store_prodlist'},'immutable');
					localStorage.setItem('appPreferences','signedUp'); //set preference to bypass loading offer in case it was nuked elsewhere
					localStorage.setItem('loadDirectly',true); //set preference to bypass loading offer in case it was nuked elsewhere
					app.model.dispatchThis('immutable');
					showContent('customer',{'show':'myaccount'})
					}
				else {
					$errorDiv.anymessage({'message':errors});
					}
				//showContent('homepage',{})
			}, //loginFrmSubmit
			
				//opens tab on product modal with recent, you may like, etc. lists
			showMoreOptions : function($this, pid) {
				var _pid = app.u.makeSafeHTMLId(pid);
				
				$this.hide();	//hide the "more options" button
					//slide tab out, when done add a border
				$('.anotherElement_'+_pid).width('0px').show().addClass('anotherElement').animate({
					'left'	: '712px',
					'width'	: '150px'
				},500);
					//reposition modal so that it is in center of screen accounting for new tab in width
				$('.quickVModal').addClass('anotherElement').animate({
					'margin':'0 50%',
					'left'	:'-430px',
				},500);
			},
			
			hideMoreOptions : function($this, pid) {
				var _pid = app.u.makeSafeHTMLId(pid);
		
				$('.anotherElement_'+_pid).animate({
					'width':'0px'
					},500, function() {
						$(this).hide();
					});
				
				$('.quickVModal').animate({
					'margin':'0 50%',
					'left'	:'-360px',
				},500,function(){$('.myelement','.quickVModal').show().css('opacity','0').animate({'opacity':'1'},500);});
				
				setTimeout(function(){
					$('.quickVModal').removeClass('anotherElement');
					$('.anotherElement_'+_pid).removeClass('anotherElement');
				},1000);
			},
			
			showAccountCreate : function() {
				$('#createaccountTemplate').dialog({
					modal	: true,
					title	: 'Create Account',
					width	: 980,
					height	: 500,
					open	: function(event, ui) { //if modal is closed, set localStorage to show preview next time, no acct. present... yet.
						$('.ui-button').off('click.closeModal').on('click.closeModal', function(){
							localStorage.setItem('loadDirectly',false);
						});
					}
				});
				app.ext.store_bmo.u.setTime();
			},
			
			showSizeChart : function() {
				$('#sizingGuideTemplate').dialog({'modal':'true', 'title':'Sizing Guide','width':800, 'height':550});
			},
			
			showStyleChart : function() {
				$('#styleGuideTemplate').dialog({'modal':'true', 'title':'Style Guide','width':800, 'height':550});
			},
		
			pauseFred : function($this) {
				//app.u.dump('gothere');
				$this.trigger('stop');
			},
		
		//**************BELOW ARE FUNCTIONS THAT MAY BE USEFULL LATER BUT ARE NOT USED IN APP YET
			
			//activates drop down menus
	/*		showDropDown : function($tag) {
				if(!$tag.data('timeoutNoShow') || $tag.data('timeoutNoShow') === 'false') {
					var $dropdown = $('.dropdown',$tag);
					var height = 0;
					$dropdown.show();
					if($dropdown.data('height')) {
						height = $dropdown.data('height');
					}
					else {
						$dropdown.children().each(function() {
							height += $(this).outerHeight();
						});
					}
					if($tag.data('timeout') && $tag.data('timeout') !== 'false') {
						clearTimeout($tag.data('timeout'));
						$tag.data('timeout','false');
					}
					$dropdown.stop().animate({'height':height+'px'},500);
					$('#mainContentArea').css('opacity','.25');
					return true;
				}
				return false;
			},
	*/	 /*	
			hideDropDown : function($tag) {
				$('.dropdown',$tag).stop().animate({'height':'0px'},500);
				if($tag.data('timeout') && $tag.data('timeout') !== 'false') {
					$tag.data('timeout');
					$tag.data('timeout','false');
				}
				$tag.data('timeout',setTimeout(function() {
					$('.dropdown',$tag).hide();
					$('#mainContentArea').css('opacity','1');
				},500));
				return true;
			},
	*/ /*	
			//places customer reviews on the product page
			showReviews : function(pid, action, hide, show) {
				var $context = $('#productTemplate_'+app.u.makeSafeHTMLId(pid));
				
				app.u.dump('SHOW REVIEW');
			
				$(action, $context).animate(1000);
				setTimeout(function() {
					$(hide, $context).hide();
					$(show, $context).show();
				}, 250);
			}, //END showReviews
	*/ /*		
			//reverts customer reveiws to the product description on the product page
			showDescription : function(pid, action, hide, show) {
				var $context = $('#productTemplate_'+app.u.makeSafeHTMLId(pid));
				
				app.u.dump('SHOW DESC');
				app.u.dump(pid);
				
				$(action, $context).animate(1000);
				setTimeout(function() {
					$(hide, $context).hide();
					$(show, $context).show();
				}, 250);
			} //END showDescription
	*/	
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
		
			test : function($tag,data) {
				app.u.dump('--> TEST'); app.u.dump(data.value); 
			},
		
				//checks for matching piece attrib in prod list item and sets sum of prices on list item if found. 
			matchingBasePrice : function($tag, data) {
				var basePrice = (data.bindData.isElastic) ? data.value.base_price/100 : data.value['%attribs']['zoovy:base_price'];
				var match = app.u.makeSafeHTMLId((data.bindData.isElastic) ? data.value.matching_piece : data.value['%attribs']['user:matching_piece']);
							
				if(match) {
					var obj = {
						pid	: match
					};
				
					var _tag = {
						"callback"		:"rendermatchingBasePrice",		
						"extension"		:"store_bmo",			
						"$container" 	: $tag,
						"loadsTemplate"	: "matchingPriceTemplate",
						"price"			: basePrice,
					};

					app.calls.appProductGet.init(obj, _tag, 'immutable');
					app.model.dispatchThis('immutable');
				}
			}, //matchingBasePrice
		
				//hides products in a product list that do not have the is_app attrib,
				//or that have a matching_piece attrib that ends in ST (is a matching bottom).
			hideFromList: function($tag, data) {
				var attribs = data.bindData.isElastic ? data.value.matching_piece : data.value['%attribs'];
				if(attribs) {
				
						//if not elastic list check if it's an app product, hide if not (elastic does this by default no need to duplicate)
					if(!data.bindData.isElastic) {
						if(!attribs['user:is_app']) $tag.parent().parent().hide();
						else if(attribs['user:is_app'] && attribs['users:is_app'] == 0) $tag.parent().parent().hide();
						else {attribs = attribs['user:matching_piece']} //must be an app product and not-elastic, set attribs to be used to hide matching piece next
					}
					
						//check if it's a matching bottom, hide if is, it will be purchasable through the matching top piece
					if(attribs) {
						var piece = attribs;
						var L = piece.length;
						var suffix = piece[L-2] + piece[L-1];
						if(suffix == 'ST') $tag.parent().parent().hide(); //if match is top, this item is a bottom so hide it.
					}
				}
			}, //hideFromList
		
				//opens e-mail in default mail provider (new window if web-based)
				//if info is available will populate subject and body w/ prod name, mfg, & price
				//if only name, subject will have name, body will be empty. If no content, no subject or body
			bindMailto : function($tag, data){
				//app.u.dump('data.value:'); app.u.dump(data.value);
				if(data.value['%attribs'] && data.value['%attribs']['zoovy:prod_name']) {
					
					var name = data.value['%attribs']['zoovy:prod_name'];
					
						//if all the info is present, add it all to the message
					if(data.value['%attribs']['zoovy:prod_mfg'] && data.value['%attribs']['zoovy:prod_msrp']) {
						var MFG = data.value['%attribs']['zoovy:prod_mfg'];
						var price = data.value['%attribs']['zoovy:prod_msrp'];
						$tag.on("click", function() {
							var eWindow = window.open("mailto:?subject=Check%20out%20the%20"+name+"%20I%20found%20on%20bikinimo.com&body="+name+",%20by%20"+MFG+",%20for%20only%20"+price+"%20"+window.location+""); //+window.location
						
								//window object has an array of content if something loaded in it.
								//the timeout was necessary to access the data to determine whether or not to close.
								//test thoroughly to determine the reliability of this method!!
								
								//the window is set, check if it's filled, and kill it if not
							setTimeout(function(){
								//app.u.dump('WindowObjectReference'); app.u.dump(eWindow.WindowObjectReference); //Security issues? check for later possibility of cleaner implementation 
								if(eWindow[0]) {//app.u.dump('Webmail, window has content don't close');
								}
								else {
									//app.u.dump('Outlook-esq, window has no content'); 
									eWindow.close();
								}
							},5000);
						});
					}
	//TODO!! SET .on() FOR THE OTHER TWO WINDOW CASES AND TEST.
					else {
						$tag.on("click", function() {
							var eWindow = window.open("mailto:?subject=Check%20out%20the%20"+name+"%20I%20found%20on%20bikinimo.com&body=%20"+window.location+"");
							setTimeout(function(){if(eWindow[0]) {} else {eWindow.close();}	},5000);
						});
					}
				}
				else {
					$tag.on("click", function() {
						var eWindow = window.open("mailto:?body="+window.location+"");
						setTimeout(function(){if(eWindow[0]) {} else {eWindow.close();}	},5000);
					});
				}
			}, //bindMailto
		
				//will combine features list in tab section on prod page for top and bottom products if they are both being added to the page
			combineFeaturesList : function($tag, data) {
				setTimeout(function(){
				//	app.u.dump('input:'); app.u.dump($('input[type=hidden]',$tag.parent()).val());
					var pid = $('input[type=hidden]',$tag.parent()).val(); 
					var $destination = $('.tabOfFeatures',$tag.parent().parent().parent().parent()); //append new content to container w/ default content
					
						//get the matching product's feature info
					if(typeof app.data['appProductGet|'+pid] == 'object') {
						var pdata = app.data['appProductGet|'+pid]
						if(pdata['%attribs'] && pdata['%attribs']['zoovy:prod_features']) {
							pdata = pdata['%attribs']['zoovy:prod_features'];
							
								//create DOM element for wiki parser, then add new content to page and remove temp element from DOM
								//most of this part from "wiki :" in controller
							var $tmp = $('<div \/>').attr('id','TEMP_'+$tag.attr('id')).hide().appendTo('body');
							var target = document.getElementById('TEMP_'+$tag.attr('id')); //### creole parser doesn't like dealing w/ a jquery object. fix at some point.
							myCreole.parse(target, pdata,{},data.bindData.wikiFormats);
							$destination.append($("<div class='clear'></div>"));
							$destination.append($tmp.html());
							$tmp.empty().remove();
						}
						else {app.u.dump('%attribs or zoovy:prod_features were not set for '+pid);}
					}else {app.u.dump('appProductGet for '+pid+' did not return as an object');}
				},500);
			}, //combineFeaturesList
			
				//reads prices for both top and bottom pieces and adds them for a total preliminary price
			customBasePrice : function($tag, data) {
				var pid = app.u.makeSafeHTMLId(data.value.pid);
				var displayPrice = 0;
				setTimeout(function(){
						//get price of each item from it's form, and add them for total
					$('form','.customATCForm',$tag.parent().parent()).each(function(){
						displayPrice += Number($('.formPrice',$(this)).attr('data-price'));
//						app.u.dump('--> price'); app.u.dump(displayPrice); 
					});

						//convert to money and replace original content w/ total value
					displayPrice = app.u.formatMoney(displayPrice,'$',2,true);
					$tag.empty().text(displayPrice);
				},250);
			},
			
				//gets and adds pricing for top & bottom pieces to hidden element, which are then read onChange of form select list
				//by changePriceDisplayed util function to alter the displayed price according to the selected pieces. 
			setHiddenPrice : function($tag, data) {
				var formDesignator = $tag.attr('data-formDesig'); //used to tell if a form has modified the displayed price
				var $summaryContainer = $tag.parent().parent().parent().parent();
				var pid = app.u.makeSafeHTMLId($('input[type="hidden"]',$tag.parent()).val()); //get pid for this form
				var prod = app.data['appProductGet|'+pid]; //get product for this form
//				app.u.dump('--> prod'); app.u.dump(prod);
				
					//add base price value to hidden element in each form
				if(prod && prod['%attribs'] && prod['%attribs']['zoovy:base_price']) {
					var displayPrice = app.ext.store_bmo_lto.u.applyLTODiscount(pid,prod['%attribs']['zoovy:base_price']);
					$tag.attr('data-price',displayPrice); 
				}
				else {app.u.dump('!! app.ext.store_bmo.renderformats.setHiddenPrice() failed !!');}
			}, //setHiddenPrice
			
			loadProd : function($tag, data){
				var obj = {									// object to hold product id for product
					"pid" : data.value,
					"withVariations":1,
					"withInventory":1
				};
					//console.debug(obj);					// see what was returned in console
				var _tag = {								// create holder for call back
					"callback":"renderMatchingProduct",		// call back function (in callbacks above)
					"extension":"store_bmo",			// extension that holds call back (this extension you're in)
					"$container" : $tag,
					"loadsTemplate" : data.bindData.loadsTemplate
				};
				app.calls.appProductGet.init(obj, _tag, 'immutable');	// call appProductGet.init on the product id with the callback and callback location
				
				//execute calls
				app.model.dispatchThis('immutable');
			},
			
			
			matchATCFormPID : function($tag, data) {
				if(typeof app.data['appProductGet|'+data.value] == 'object') {
					var pdata = app.data['appProductGet|'+data.value]['%attribs'];
					if(app.u.isSet(pdata['user:matching_piece'])){
						var matchData = pdata['user:matching_piece'];
					}
				}
				$tag.append("<input type='hidden' name='sku' value='"+matchData+"' />");
			},
		
			//adds class w/ pid of matching top or bottom of suit for product page that is loaded
			//so that anyContent can locate in product page modal
			addMatch : function($tag, data) {
				if(typeof app.data['appProductGet|'+data.value.pid] == 'object') {
					var pdata = app.data['appProductGet|'+data.value.pid]['%attribs'];
					if(app.u.isSet(pdata['user:matching_piece'])){
						var matchData = pdata['user:matching_piece'];
					}
				}
				//$tag.attr('data-pid',data.value.pid);
				$tag.addClass('match_'+matchData);
			},
			
			//add class w/ pid to be used as a selector for moreOptions section in prod page modal
			classyId : function($tag, data) {
				if(data.value.pid){
					var pid = app.u.makeSafeHTMLId(data.value.pid)
					$tag.addClass('anotherElement_'+pid);
				}
			},
					
			addInfiniteSlider : function($tag,data)	{
//				app.u.dump("BEGIN store_bmo.renderFormats.addInfiniteSlider: "+data.value);
				var width = data.bindData.width;
				var height = data.bindData.height;
				
				if(data.bindData.isElastic) { 
					//app.u.dump(data.value);
					data.value.is_square ? height = width : height = height; //make it square if the square attrib is there
						//after height is determined to be square or not, add image in with the dimensions found.
					if(data.value.images && data.value.images[0]) {
						$tag.append(app.u.makeImage({"name":data.value.images[0],"w":width,"h":height,"b":"FFFFFF","tag":1}));
						
							//if more than one pic assigned add image slider
						if(data.value.images[0] && data.value.images[1]) { 
							$tag.attr('data-images',data.value.images);
							$tag.attr('data-lastic',true);
							$tag.on('mouseenter.myslider',app.ext.store_bmo.u.addPicSlider2UL);
						}
					}
					else {	
							//if image is not found this blank place-holder will help keep flow consistent
						$tag.before($('<div style="width:'+width+'px; height:'+width+'px;"></div>'));
					}
				}
				
				else if(typeof data.value == 'object') {
					if(data.value['%attribs']) { 
						var pdata = data.value['%attribs'];	
						
						pdata['user:is_square'] ? height = width : height = height; //make it square if the square attrib is there
							//after height is determined to be square or not, add image in with the dimensions found.
						$tag.append(app.u.makeImage({"name":pdata['zoovy:prod_image1'],"w":width,"h":height,"b":"FFFFFF","tag":1}));
						
						//if image 1 or 2 isn't set, likely there are no secondary images. stop.
						if(app.u.isSet(pdata['zoovy:prod_image1']) && app.u.isSet(pdata['zoovy:prod_image2']))	{
							$tag.attr('data-pid',data.value.pid); //no params are passed into picSlider function, so pid is added to tag for easy ref.
	//						app.u.dump(" -> image1 ["+pdata['zoovy:prod_image1']+"] and image2 ["+pdata['zoovy:prod_image2']+"] both are set.");
	//adding this as part of mouseenter means pics won't be downloaded till/unless needed.
	//no anonymous function in mouseenter. We'll need this fixed to ensure no double add (most likely) if template re-rendered.
	//							$tag.unbind('mouseenter.myslider'); // ensure event is only binded once.
								$tag.on('mouseenter.myslider',app.ext.store_bmo.u.addPicSlider2UL);//.bind('mouseleave',function(){window.slider.kill()})
							}
						}
					}
				},
				
				
				
/**************BELOW ARE FUNCTIONS THAT MAY BE USEFULL LATER BUT ARE NOT USED IN APP YET

			//HIDE ZERO INVENTORY IN PRODUCT LISTS (MUST USE INFINITE SCROLL ON LISTS)
			hideZeroInv : function($tag, data) {
				var pid = data.value.pid;
				//app.u.dump('***PID:'); app.u.dump(pid);
				if(data.value['@inventory'] && data.value['@inventory'][pid]) {
					var inventory = data.value['@inventory'][pid]['inv'];
					if(inventory < 1) {
						//have to put hideMe class into css w/ displayNone and any other requirements
						$tag.addClass('hideMe');
					}
				}
			},
	*/		
		}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
				//sets a date X days from current date on hidden input in acct creation form to use as expiration for new acct gift card.
			setTime : function() {
				var d = new Date().getTime() + 604800000; //7 days in milliseconds
				d = d.toString().slice(0,10);
//				app.u.dump('--> setTime date:'); app.u.dump(d); app.u.dump(app.ext.store_bmo.u.millisecondsToYYYYMMDD(new Date(d)));
				$("input[name=time]",'#createaccountTemplate').val(d).attr("disabled",true);
			},
		
			addRecentlyViewedItems : function() {
			//	app.u.dump('store_bmo recentlyViewedItems has been run');
				
					//get pid of product modal when it closes
				var pid = app.u.makeSafeHTMLId($('.popupshado','.quickVModal').attr('data-pid'));
				
					//add item to session var
				if($.inArray(pid,app.ext.myRIA.vars.session.recentlyViewedItems) < 0)	{
					app.ext.myRIA.vars.session.recentlyViewedItems.unshift(pid);
					}
				else	{
					//the item is already in the list. move it to the front.
					app.ext.myRIA.vars.session.recentlyViewedItems.splice(0, 0, app.ext.myRIA.vars.session.recentlyViewedItems.splice(app.ext.myRIA.vars.session.recentlyViewedItems.indexOf(pid), 1)[0]);
					}
			//	app.u.dump(app.ext.myRIA.vars.session);
			//	app.u.dump('modal pid:'); app.u.dump(pid);
			}, //addRecentlyViewedItems
				
				//loads product in hompage accessories tab	
			loadProductsAsList :function(passedCat) {
			
				var _tag = {
					"callback":"renderProductsAsList",
					"extension":"store_bmo"
				}
				app.ext.store_navcats.calls.appNavcatDetail.init(passedCat, _tag,'immutable');
	
				app.model.dispatchThis('immutable');
			
			}, //loadProductsAsList
		
			//replacement for bindByAnchor href to make crawlable links. (works everywhere)
			bindOnclick : function() {
				$('body').off('click', 'a[data-onclick]').on('click', 'a[data-onclick]', function(event){
					 var $this = $(this);
					 var P = app.ext.myRIA.u.parseAnchor($this.data('onclick'));
					 return app.ext.myRIA.a.showContent('',P);
				});
			},
			
			//anyContent to add matching top or bottom to a top or bottom prod page
			loadMatchingProduct : function(pid) {
				//app.u.dump('PID:'); app.u.dump(pid);
				var matchData = "";
				if(typeof app.data['appProductGet|'+pid] == 'object') { 
					if(app.data['appProductGet|'+pid]) {
						var pdata = app.data['appProductGet|'+pid]['%attribs'];
						//app.u.dump('pdata'); app.u.dump(pdata);
						if(app.u.isSet(pdata['user:matching_piece'])){
							matchData = pdata['user:matching_piece'];
							//app.u.dump('matchData'); app.u.dump(matchData);
						}
					}
				}
				
				if(matchData) {
					var obj = {									// object to hold product id for product
						"pid" : matchData
					};
						//console.debug(obj);					// see what was returned in console
					var _tag = {								// create holder for call back
						"callback":"renderMatchingProduct",		// call back function (in callbacks above)
						"extension":"store_bmo"					// extension that holds call back (this extension you're in)
					};
					app.calls.appProductGet.init(obj, _tag, 'immutable');	// call appProductGet.init on the product id with the callback and callback location
					
					//execute calls
					app.model.dispatchThis('immutable');			
				}
				else { //no match data don't add any content
				}
			},
			
			addPicSlider2ElasticUL : function(info) {
				app.u.dump('in addPicSlider2ElasticUL'); 
	/*			var $obj = $(this);
				if($obj.data('slider') == 'rendered') {
					//do nothing. list has aready been generated.
				}
				else {
					$obj.data('slider','rendered'); //used to determine if the ul contents have already been added.
					app.u.dump($obj);
				}
	*/		},

			//obj is going to be the container around the img. probably a div.
			//the internal img tag gets nuked in favor of an ordered list.
			addPicSlider2UL : function($tag, info){
//				app.u.dump("BEGIN store_bmo.u.addPicSlider2UL");
				
				var $obj = $(this);
		
				if($obj.data('slider') == 'rendered') {
					//do nothing. list has aready been generated.
				}
				else {
					$obj.data('slider','rendered'); //used to determine if the ul contents have already been added.
					var pid = $obj.attr('data-pid');
					//app.u.dump(" -> pid: "+pid);					
					var $img = $obj.find('img')
					var width = $img.attr('width'); //using width() and height() here caused unusual results in the makeImage function below.
					var height = $img.attr('height');
					$obj.width(width).height(height).css({'overflow':'hidden','position':'relative'});
					var $ul = $('<ul>').addClass('slideMe'); //.css({'height':height+'px','width':'20000px'}); /* inline width to override inheretance */

					var $li; //recycled.
					if($obj.attr('data-lastic')){
						var data = $obj.attr('data-images').split(',');
						
						for(var i = 2; i <= 10; i += 1)	{
							if(data[i])	{
								$li = $('<li>').append(app.u.makeImage({"name":data[i],"w":width,"h":height,"b":"FFFFFF","tag":1}));
								$li.appendTo($ul);
							}
							else	{break} //end loop at first empty image spot.
							}
					} 
					else { 
						var data = app.data['appProductGet|'+pid]['%attribs'];
						for(var i = 2; i <= 10; i += 1)	{
							if(data['zoovy:prod_image'+i])	{
								$li = $('<li>').append(app.u.makeImage({"name":data['zoovy:prod_image'+i],"w":width,"h":height,"b":"FFFFFF","tag":1}));
								$li.appendTo($ul);
							}
						else	{break} //end loop at first empty image spot.
						}
					}
					
					$li = $("<li>").append($img);
					$ul.prepend($li); //move the original image to the front of the list instead of re-requesting it. prevents a 'flicker' from happening
					$obj.append($ul); //kill existing image. will b replaced w/ imagery in ul.
//					$img.remove(); //get rid of original img instance.

					$("ul:first-child",$obj).infiniteCarousel(
						{
							displayTime			: 0,
							transitionSpeed		: 3000,
							displayProgressRing	: false,
							imagePath			: "images/",
						//	showControls		: false,	//controls hidden w/ css, removing from plugin produced un-desired effects
						//	autoPilot			: true		//turn on to make prod images party all night long!
						}
					);

				//	window.slider = new imgSlider($('ul',$obj))
				}
			},	
			
			handleAppLoginCreate : function($form)	{
				if($form)	{
					var formObj = $form.serializeJSON();
		//app.u.dump('--> Form Object'); app.u.dump(formObj); 			
					if(formObj.pass !== formObj.pass2) {
						app.u.throwMessage('Sorry, your passwords do not match! Please re-enter your password');
						return;
					}
					
					var tagObj = {
						'callback':function(rd) {
							if(app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								localStorage.setItem('loadDirectly',true); //acct created set local to skip preview next time
								//localStorage.removeItem('appPreferences');
								//localStorage.appPreferences = 'signedUp';
								showContent('customer',{'show':'myaccount'});
								app.u.throwMessage(app.u.successMsgObject("A gift card has been added to your account, look for it during checkout."));
								//app.u.throwMessage(app.u.successMsgObject("Your account has been created! Check your welcome e-mail for a gift from Bikinimo."));
							}
						}
					}
					
					formObj._vendor = "bikinimo";
					app.calls.appBuyerCreate.init(formObj,tagObj,'immutable');				
					app.model.dispatchThis('immutable');
				}
				else {
					$('#globalMessaging').anymessage({'message':'$form not passed into myRIA.u.handleBuyerAccountCreate','gMessage':true});
				}
			},
			
				//function for console testing acct. creation to debug gift card at acct. create. Can be removed once debug is complete.
			testLogin : function(itteration) {
				formObj = {
					"address1"		: "123 Test"+itteration,
					"address2"		: "",
					"city"			: "Test"+itteration,
					"country"		: "USA",
					"email"			: "Test"+itteration+"@ztest.com",
					"firstname"		: "Test"+itteration,
					"form"			: "wholesale",
					"lastname"		: "Test"+itteration,
					"pass"			: "12345678P",
					"pass2"			: "12345678P",
					"phone"			: "5555555555",
					"postal"		: "92562",
					"region"		: "CA",
					"time"			: 1395277298,
					"vendor"		: "bikinimo"
				}
				app.u.dump('--> test form:'); app.u.dump(formObj);
				
				var tagObj = {
					'callback':function(rd) {
						if(app.model.responseHasErrors(rd)) {
							$('#mainContentArea').anymessage({'message':rd});
						}
						else {
							localStorage.setItem('loadDirectly',true);
							//localStorage.removeItem('appPreferences');
							//localStorage.appPreferences = 'signedUp';
							showContent('customer',{'show':'myaccount'});
							app.u.throwMessage(app.u.successMsgObject("Your account has been created!"));
						}
					}
				}
				
				formObj._vendor = "bikinimo";
				app.calls.appBuyerCreate.init(formObj,tagObj,'immutable');				
				app.model.dispatchThis('immutable');
			},
			
			toSt : function(n) {
				var s = '';
				if(n < 10) s +='0';
			//	app.u.dump(n); app.u.dump(s); 
				return s+n.toString();
			},
			
			makeUTCFloridaTimeMS : function() {
				var d = new Date();
				var localTime = d.getTime();
				var localOffset = d.getTimezoneOffset() * 6000;
				var UTC = localTime + localOffset;
				var destOffset = 4; 
				var homeTime = UTC + (3600000*destOffset);
				return homeTime; 
			},
			
			makeUTCTimeMS : function() {
				var d = new Date();
				var localTime = d.getTime();
				var localOffset = d.getTimezoneOffset() * 6000;
				var UTC = localTime + localOffset;
				return UTC; 
			},
			
			millisecondsToYYYYMMDDHH : function(dateObj) {
				var year = dateObj.getFullYear();
				var month = dateObj.getMonth()+1; 
				var day = dateObj.getDate();
				var hours = dateObj.getHours();
				if (month < 10){month = '0'+month};
				if (day < 10){day = '0'+day};
				return ""+year+month+day+hours;
			},
			
			millisecondsToYYYYMMDD : function(dateObj) {
				var year = dateObj.getFullYear();
				var month = dateObj.getMonth()+1; 
				var day = dateObj.getDate();
				if (month < 10){month = '0'+month};
				if (day < 10){day = '0'+day};
				return ""+year+month+day;
			},
			
			//returns text format of day of the week based on date object value passed in
			getDOWFromDay : function(X)	{
//				app.u.dump("BEGIN beachmart.u.getDOWFromDay ["+X+"]");
				var weekdays = new Array('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
				return weekdays[X];
			},
			
			//returns text format of month of the year based on date object value passed in
			getMonthFromNumber : function(X) {
				var months = new Array('january','february','march','april','may','june','july','august','september','october','november','december');
				return months[X];
			},
		
			//returns: MONTH DAY, YEAR HOUR MIN SEC format. ie: september 14, 2013 16:48:10
			yyyymmdd2Pretty : function(str)	{
				var r = false;
				if(Number(str))	{
					var year = str.substr(0,4);
					var month = Number(str.substr(4,2));
					var day = str.substr(6,2);
					var hour = str.substr(8,2);
					var d = new Date();
					//mins and secs may not always be passed, use value if they are, 0 if not
					if (str.substr(10,2)) {var min = str.substr(10,2);}
					else {var min = 0;}
					if (str.substr(12,2)) {var sec = str.substr(12,2);}
					else {var sec = 0;}
					d.setFullYear(year, (month - 1), day);
//					app.u.dump(" date obj: "); app.u.dump(d);
//					app.u.dump(" -> YYYYMMDD2Pretty ["+str+"]: Y["+year+"]  Y["+month+"]  Y["+day+"] ");
					r = this.getMonthFromNumber(d.getMonth())+" "+day+", "+year+" "+hour+":"+min+":"+sec;
				}
				else	{
					app.u.dump("WARNING! the parameter passed into YYYYMMDD2Pretty is not a number ["+str+"]");
				}
				return r;
			}, //yyyymmdd2Pretty 
			
			runHomeCarouselTab1 : function($context) {
				var $target = $('.productList1',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	: 920,
							height	: 265,
							items	: 
							{
								minimum 	: 1
							},
							auto	: 
							{
								items			: 1,
								duration		: 3000,
								easing			: 'linear',
								timeoutDuration	: 0,
								pauseOnHover	: 'immediate'
							},
							prev	: '.caroPrev1',
							next	: '.caroNext1',
						}).trigger('play');
					},2000);
					
					//previous button hover action
					$('.caroPrev1', $context).hover(function(){
						$target.trigger('configuration', ['direction','right']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					//next button hover action
					$('.caroNext1', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					$('.homeTab1', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					});
				}
			},
			
			runHomeCarouselTab2 : function($context) {
				var $target = $('.productList2',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	: 920,
							height	: 265,
							items	: 
							{
								minimum 	: 1
							},
							auto	: 
							{
								items			: 1,
								duration		: 3000,
								easing			: 'linear',
								timeoutDuration	: 0,
								pauseOnHover	: 'immediate'
							},
							prev	: '.caroPrev2',
							next	: '.caroNext2',
						}).trigger('play');
					},2000);
					
					//previous button hover action
					$('.caroPrev2', $context).hover(function(){
						$target.trigger('configuration', ['direction','right']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					//next button hover action
					$('.caroNext2', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					$('.homeTab2', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					});
				}
			},
			
			runHomeCarouselTab3 : function($context) {
				var $target = $('.productList3',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	: 920,
							height	: 265,
							items	: 
							{
								minimum 	: 1
							},
							auto	: 
							{
								items			: 1,
								duration		: 3000,
								easing			: 'linear',
								timeoutDuration	: 0,
								pauseOnHover	: 'immediate'
							},
							prev	: '.caroPrev3',
							next	: '.caroNext3',
						}).trigger('play');
					},2000);
					
					//previous button hover action
					$('.caroPrev3', $context).hover(function(){
						$target.trigger('configuration', ['direction','right']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					//next button hover action
					$('.caroNext3', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
										
					$('.homeTab3', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					});
				}
			},
			
			runHomeCarouselTab4 : function($context) {
				var $target = $('.productList4',$context);
				if($target.data('isCarousel')) {} //only make it a carousel once.
				else {
					$target.data('isCarousel',true);
					//for whatever reason, caroufredsel needs to be executed after a moment.
					setTimeout(function(){
						$target.carouFredSel({
							width	: 920,
							height	: 265,
							items	: 
							{
								minimum 	: 1
							},
							auto	: 
							{
								items			: 1,
								duration		: 3000,
								easing			: 'linear',
								timeoutDuration	: 0,
								pauseOnHover	: 'immediate'
							},
							prev	: '.caroPrev4',
							next	: '.caroNext4',
						}).trigger('play');
					},2000);
					
					//previous button hover action
					$('.caroPrev4', $context).hover(function(){
						$target.trigger('configuration', ['direction','right']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
					
					//next button hover action
					$('.caroNext4', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					}).click(function(){
						return false;
					});
										
					$('.homeTab4', $context).hover(function(){
						$target.trigger('configuration', ['direction','left']);
						$target.trigger('play');
					});
				}
			},
			

		
		
		
		
		
/*******UTIL FUNCTIONS THAT WILL POSSIBLY BE USEFULL, BUT NOT PART OF APP YET	
			setTitle : function(title) {
				if(title && typeof title === "string") {
					//This is what is expected
				}
				else {
					//set title
					title = "BikiniMo Merchandise"
				}
				document.title = title+" | BikiniMo";
			}, //end setTitle
			
			sansReviews : function($context) {
				if($('.noReviews', $context).children().length === 0) {
					app.u.dump('No reviews. Running existing messge check');
					if(($('.reviewsCont', $context).length === 0) || ($('.reviewsCont', $context).length === null)) {
						app.u.dump('No message exists. Display message');
						$('.beFirst', $context).append(
						'<p class="reviewsCont">'
						+'Be the <strong>First</strong> to Review This Product!'
						+'</p>');
						app.u.dump('Reveiw message displaying for : '+$context);
					}
					else {
						app.u.dump('Message exists, do nothing');
					}
				}
				else {
					app.u.dump('Reviews exist, function aborted. Reviews length: '+$('.reviewsBind').children.length);
				}
			},
	*/	
/*
P.pid, P.templateID are both required.
modal id is fixed. data-pid is updated each time a new modal is created.
if a modal is opened and p.pid matches data-pid, do NOT empty it. could be a modal that was closed (populated) but not submitted. preserve data.
if the P.pid and data-pid do not match, empty the modal before openeing/populating.
!!! incomplete.
*/
	/*		showReviewFrmInline : function(P, hide)	{
				if(!P.pid || !P.templateID)	{
					app.u.dump(" -> pid or template id left blank");
					}
				else	{
					var $parent = $('#review-wrapper'+P.pid);
					//if no review wrapper has been created before, create one. 
					if($parent.length == 0)	{
						app.u.dump(" -> wrapper doesn't exist. create it.");
//						app.u.dump($("<div \/>").attr({"id":"review-wrapper",'data-pid':P.pid}));
//						app.u.dump(('.prodWriteReviewContainer','#productTemplate_'+P.pid));
						$parent = $("<div \/>").attr({"id":"review-wrapper"+P.pid,'data-pid':P.pid}).appendTo('.prodWriteReviewContainer','#productTemplate_'+P.pid);
						}
					else	{
						app.u.dump(" -> use existing wrapper. empty it.");
						//this is a new product being displayed in the viewer.
						$parent.empty();
						}
//	$parent.dialog({modal: true,width: ($(window).width() > 500) ? 500 : '90%',height:500,autoOpen:false,"title":"Write a review for "+P.pid});
//the only data needed in the reviews form is the pid.
//the entire product record isn't passed in because it may not be available (such as in invoice or order history, or a third party site).
					$parent.append(app.renderFunctions.transmogrify({id:'review-wrapper_'+P.pid},P.templateID,{'pid':P.pid}));
					$(hide,'#productTemplate_'+P.pid).css('display','none');
					$('.prodWriteReviewContainer','#productTemplate_'+P.pid).css('display','block');
					}
				},
	*/	
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			}, //e [app Events]
			
		

		variations : {
		
			renderOptionCUSTOMSELECT : function(pog) {
			
			//	app.u.dump('POG -> '); app.u.dump(pog);

			//	app.u.dump('BEGIN renderOptionSELECT for pog '+pog.id+' and safe id = '+safeid);
				var pogid = pog.id;
				var $parentDiv = $("<span \/>");
				var $selectList = $("<select  class='prodOpt' onChange='app.ext.store_bmo.a.changePriceDisplayed($(this))'>").attr({"name":pogid});
				var i = 0;
				var len = pog['@options'].length;

				var selOption; //used to hold each option added to the select
				var optionTxt;

			//if the option is 'optional' AND has more than one option, add blank prompt. If required, add a please choose prompt first.
				if(len > 0)	{
					optionTxt = (pog['optional'] == 1) ?  "" :  "Select";
					selOption = "<option value='' disable='disabled' selected='selected'>"+optionTxt+"<\/option>";
					$selectList.append(selOption);
					}
			//adds options to the select list.
				while (i < len) {
					optionTxt = pog['@options'][i]['prompt'];
					if(pog['@options'][i]['p'])
						optionTxt += pogs.handlePogPrice(pog['@options'][i]['p']); //' '+pog['@options'][i]['p'][0]+'$'+pog['@options'][i]['p'].substr(1);
					selOption = "<option value='"+pog['@options'][i]['v']+"'>"+optionTxt+"<\/option>";
					$selectList.append(selOption);
					i++;
					}

			//	app.u.dump(" -> pogid: "+pogid);
			//	app.u.dump(" -> pog hint: "+pog['ghint']);
				$selectList.appendTo($parentDiv);
				if(pog['ghint']) {$parentDiv.append(pogs.showHintIcon(pogid,pog['ghint']))}
				return $parentDiv;

				
			}, //renderOptionCUSTOMSELECT
			
			xinit : function(){
				this.addHandler("type","select","renderOptionCUSTOMSELECT");
				//app.u.dump("--- RUNNING XINIT");
			}
		
		} //variations
			
		} //r object.
	return r;
	}