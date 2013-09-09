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
		eventdate : new Date("september 6, 2013 15:48:59")
	},

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
				app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj) {
					var $context = $(app.u.jqSelector('#'+infoObj.parentID));
					if(!$context.data('countingdown')) {
						app.ext.store_bmo.u.countdown($context);
						$context.data('countingdown');
					}
					app.ext.store_bmo.u.runHomeCarouselTab1($context);
					app.ext.store_bmo.u.runHomeCarouselTab2($context);
					app.ext.store_bmo.u.runHomeCarouselTab3($context);
					app.ext.store_bmo.u.runHomeCarouselTab4($context);
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
		
			showSizeChart : function() {
				$('#sizingGuideTemplate').dialog({'modal':'true', 'title':'Sizing Guide','width':800, height:550});
			},
			
			showStyleChart : function() {
				$('#styleGuideTemplate').dialog({'modal':'true', 'title':'Style Guide','width':800, height:550});
			},
		
			pauseFred : function($this) {
				//app.u.dump('gothere');
				$this.trigger('stop');
			},
		
		//**************BELOW ARE FUNCTIONS THAT MAY BE USEFULL LATER BUT ARE NOT USED IN APP YET
	
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
					
			//embeds youtube video directly into $tag (built for product modal, but should work elsewhere)
			youtubeIframe : function($tag,data)	{
				var $ele = $('.youtubeVideoContainer');
				if ($ele.length == 0) {
					$ele = $('<div />').attr('class','youtubeVideoContainer').appendTo($tag);
				}
				$ele.empty().append("<iframe width='305' height='172' src='https://i3.ytimg.com/vi/"+data.value+"' frameborder='0' allowfullscreen></iframe>"); //clear any past videos.
				//$tag.attr('src',"https://i3.ytimg.com/vi/iAIE1RBPyO0/1.jpg");
				return false;
			}, //youtubeIframe
					
			addInfiniteSlider : function($tag,data)	{
//				app.u.dump("BEGIN myRIA.renderFormats.addPicSlider: "+data.value);
				if(typeof app.data['appProductGet|'+data.value] == 'object')	{
					var pdata = app.data['appProductGet|'+data.value]['%attribs'];
					//if image 1 or 2 isn't set, likely there are no secondary images. stop.
					if(app.u.isSet(pdata['zoovy:prod_image1']) && app.u.isSet(pdata['zoovy:prod_image2']))	{
						$tag.attr('data-pid',data.value); //no params are passed into picSlider function, so pid is added to tag for easy ref.
//						app.u.dump(" -> image1 ["+pdata['zoovy:prod_image1']+"] and image2 ["+pdata['zoovy:prod_image2']+"] both are set.");
//adding this as part of mouseenter means pics won't be downloaded till/unless needed.
// no anonymous function in mouseenter. We'll need this fixed to ensure no double add (most likely) if template re-rendered.
//							$tag.unbind('mouseenter.myslider'); // ensure event is only binded once.
							$tag.bind('mouseenter.myslider',app.ext.store_bmo.u.addPicSlider2UL);//.bind('mouseleave',function(){window.slider.kill()})
						}
					}
				},
				
				
				
//**************BELOW ARE FUNCTIONS THAT MAY BE USEFULL LATER BUT ARE NOT USED IN APP YET

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
			
		}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
		
			//obj is going to be the container around the img. probably a div.
			//the internal img tag gets nuked in favor of an ordered list.
			addPicSlider2UL : function(){
//				app.u.dump("BEGIN store_bmo.u.addPicSlider2UL");
				
				var $obj = $(this);
				if($obj.data('slider') == 'rendered') {
					//do nothing. list has aready been generated.
//					app.u.dump("the slideshow has already been rendered. re-init");
				//	window.slider.kill(); //make sure it was nuked.
				//	window.slider = new imgSlider($('ul',$obj))
				}
				else {
					$obj.data('slider','rendered'); //used to determine if the ul contents have already been added.
					var pid = $obj.attr('data-pid');
//					app.u.dump(" -> pid: "+pid);
					var data = app.data['appProductGet|'+pid]['%attribs'];
					var $img = $obj.find('img')
					var width = $img.attr('width'); //using width() and height() here caused unusual results in the makeImage function below.
					var height = $img.attr('height');
					$obj.width(width).height(height).css({'overflow':'hidden','position':'relative'});
					var $ul = $('<ul>').addClass('slideMe'); //.css({'height':height+'px','width':'20000px'}); /* inline width to override inheretance */
					
					var $li; //recycled.
					for(var i = 2; i <= 10; i += 1)	{
						if(data['zoovy:prod_image'+i])	{
							$li = $('<li>').append(app.u.makeImage({"name":data['zoovy:prod_image'+i],"w":width,"h":height,"b":"FFFFFF","tag":1}));
							$li.appendTo($ul);
						}
						else	{break} //end loop at first empty image spot.
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
							productID			: ''+pid
						//	showControls		: false,	controls hidden w/ css, removing from plugin produced un-desired effects
						//	autoPilot			: true
						}
					);

				//	window.slider = new imgSlider($('ul',$obj))
				}
			},	
		
			toSt : function(n) {
				var s = '';
				if(n < 10) s +='0';
			//	app.u.dump(n); app.u.dump(s); 
				return s+n.toString();
			},
			
			countdown : function($context) {
				
				var cl = $('form[name="clock"]', $context);
				var d = new Date();
				var count=Math.floor((app.ext.store_bmo.vars.eventdate.getTime()-d.getTime())/1000);
			//	app.u.dump('count is: '); app.u.dump(count);

				if(count<=0) {
					$('input[name=days]', cl).val('00');
					$('input[name=hours]', cl).val('00');
					$('input[name=mins]', cl).val('00');
					$('input[name=secs]', cl).val('00');
					
					$('#deal',$context).removeClass('visibilityHidden');
					//document.getElementById("deal").style.display = 'block';
				}
				else {
					$('#deal',$context).addClass('visibilityHidden');
					//document.getElementById("deal").style.display = 'none';
				
					$('input[name=secs]', cl).val(''+app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=mins]', cl).val(''+app.ext.store_bmo.u.toSt(count%60));
					count=Math.floor(count/60);
					$('input[name=hours]', cl).val(''+app.ext.store_bmo.u.toSt(count%24));
					count=Math.floor(count/24);
					$('input[name=days]', cl).val(''+count);    
				
					setTimeout(function(){app.ext.store_bmo.u.countdown($context);},1000);
				}
			},
			
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
			

		
		
		
		
		
/*******UTIL FUNCTIONS THAT WILL POSSIBLY BE USEFULL, BUT NOT PART OF APP YET*/		
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