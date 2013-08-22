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

	},

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj) {
					
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
					} else	{
						setTimeout(function(){app.ext.store_bmo.callbacks.startExtension.onSuccess()},250);
					}
				},
				onError : function (){
					app.u.dump('BEGIN app.ext.store_bmo.callbacks.startExtension.onError');
				}
			}
			
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
	
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
					app.model.dispatchThis('immutable');
					}
				else {
					$errorDiv.anymessage({'message':errors});
					}
				showContent('customer',{'show':'myaccount'})
			}, //loginFrmSubmit
			
			//activates drop down menus
			showDropDown : function($tag) {
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
		
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
		
			//HIDE ZERO INVENTORY IN PRODUCT LISTS
			var pid = data.value.pid;
			//app.u.dump('***PID:'); app.u.dump(pid);
			if(data.value['@inventory'] && data.value['@inventory'][pid]) {
				var inventory = data.value['@inventory'][pid]['inv'];
				if(inventory < 1) {
					$tag.addClass('hideMe');
					//$('.boxShadower',$tag).css('background','red');
				}
			}
			
		}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			toSt : function(n) {
				var s = '';
				if(n < 10) s +='0';
				//app.u.dump(n); app.u.dump(s); 
				return s+n.toString();
			},
			
			countdown : function() {
				cl=document.clock;
				d=new Date();
				count=Math.floor((eventdate.getTime()-d.getTime())/1000);
				if(count<=0)
				{cl.days.value ="00";
				cl.hours.value="00";
				cl.mins.value="00";
				cl.secs.value="00";
				return;
				document.getElementById("deal").style.display = 'block';
				}
				else {
				document.getElementById("deal").style.display = 'none';
				}
				cl.secs.value=app.ext.store_bmo.u.toSt(count%60);
				count=Math.floor(count/60);
				cl.mins.value=app.ext.store_bmo.u.toSt(count%60);
				count=Math.floor(count/60);
				cl.hours.value=app.ext.store_bmo.u.toSt(count%24);
				count=Math.floor(count/24);
				cl.days.value=count;    

				setTimeout("countdown()",500);
				}
			
		
		
		
		
		
/*******FUNCTIONS THAT WILL POSSIBLY BE USEFULL, BUT NOT PART OF APP YET*/		
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
			
			handleAppLoginCreate : function($form)	{
				if($form)	{
					var formObj = $form.serializeJSON();
					
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
								showContent('customer',{'show':'myaccount'});
								app.u.throwMessage(app.u.successMsgObject("Your account has been created!"));
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
		
/*
P.pid, P.templateID are both required.
modal id is fixed. data-pid is updated each time a new modal is created.
if a modal is opened and p.pid matches data-pid, do NOT empty it. could be a modal that was closed (populated) but not submitted. preserve data.
if the P.pid and data-pid do not match, empty the modal before openeing/populating.
!!! incomplete.
*/
			showReviewFrmInline : function(P, hide)	{
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
		
			runCarousel : function() {
				var $target = $('.logoCarousel');
				if($target.data('isCarousel')) {} //only make it a carousel once (even though it's in the footer)
				setTimeout(function(){	//for whatever reason, caroufredsel needs to be executed after a moment
					$target.carouFredSel({
						responsive	:	true,
						width		: 	'100%',
						height		:	100,
						items: { 	
							visible	:	{
											min	: 1,
											max	: 5
										},
							width	:	125,//'variable',
							height	:	'variable'//100
						},
						swipe: {
							onMouse	: 	true,
							onTouch	: 	true
						},
						auto		: 	false,
						next		:	'.footerPrev',
						prev		:	'.footerNext'
					});
				},2000);
			},
		
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			} //e [app Events]
		} //r object.
	return r;
	}