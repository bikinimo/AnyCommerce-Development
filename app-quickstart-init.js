var app = app || {vars:{},u:{}}; //make sure app exists.
app.rq = app.rq || []; //ensure array is defined. rq = resource queue.



app.rq.push(['extension',0,'orderCreate','extensions/checkout/extension.js']);
app.rq.push(['extension',0,'cco','extensions/cart_checkout_order.js']);


app.rq.push(['extension',0,'store_prodlist','extensions/store_prodlist.js']);
app.rq.push(['extension',0,'prodlist_infinite','extensions/prodlist_infinite.js']);
app.rq.push(['extension',0,'store_navcats','extensions/store_navcats.js']);
app.rq.push(['extension',0,'store_search','extensions/store_search.js']);
app.rq.push(['extension',0,'store_product','extensions/store_product.js']);
app.rq.push(['extension',0,'store_cart','extensions/store_cart.js']);
app.rq.push(['extension',0,'store_crm','extensions/store_crm.js']);
app.rq.push(['extension',0,'myRIA','app-quickstart.js','startMyProgram']);

app.rq.push(['extension',0,'entomologist','extensions/entomologist/extension.js']);
app.rq.push(['extension',0,'tools_animation','extensions/tools_animation.js']);

app.rq.push(['extension',0,'fancybox','extensions/fancybox/extension_fancybox.js','startExtension']);
app.rq.push(['extension',0,'tools_lightbox','extensions/tools_lightbox/tools_lightbox.js']);
app.rq.push(['extension',0,'tools_youtube','extensions/tools_youtube.js']);

app.rq.push(['extension',1,'google_analytics','extensions/partner_google_analytics.js','startExtension']);
//app.rq.push(['extension',1,'tools_ab_testing','extensions/tools_ABtesting.js']);
//app.rq.push(['extension',1,'powerReviews','extensions/reviews_powerreviews.js','startExtension']);
//app.rq.push(['extension',0,'partner_addthis','extensions/partner_addthis.js','startExtension']);
//app.rq.push(['extension',1,'resellerratings_survey','extensions/partner_buysafe_guarantee.js','startExtension']); /// !!! needs testing.
//app.rq.push(['extension',1,'buysafe_guarantee','extensions/partner_buysafe_guarantee.js','startExtension']);
//app.rq.push(['extension',1,'powerReviews_reviews','extensions/partner_powerreviews_reviews.js','startExtension']);
//app.rq.push(['extension',0,'magicToolBox_mzp','extensions/partner_magictoolbox_mzp.js','startExtension']); // (not working yet - ticket in to MTB)

app.rq.push(['extension',0,'store_bmo','extensions/store_bmo.js','startExtension']);
app.rq.push(['extension',0,'cart_quickadd','extensions/cart_quickadd/extension.js']);
app.rq.push(['extension',0,'store_bmo_lto','extensions/limited_time_offer/store_bmo_lto.js']);
app.rq.push(['extension',0,'store_filter','extensions/store_filter.js']);
app.rq.push(['extension',0,'store_bmo_signup','extensions/store_bmo_signup.js']);

app.rq.push(['script',0,(document.location.protocol == 'file:') ? app.vars.testURL+'jsonapi/config.js' : app.vars.baseURL+'jquery/config.js']); //The config.js is dynamically generated.
app.rq.push(['script',0,app.vars.baseURL+'model.js']); //'validator':function(){return (typeof zoovyModel == 'function') ? true : false;}}
app.rq.push(['script',0,app.vars.baseURL+'includes.js']); //','validator':function(){return (typeof handlePogs == 'function') ? true : false;}})

app.rq.push(['script',0,app.vars.baseURL+'controller.js']);

app.rq.push(['script',0,app.vars.baseURL+'resources/jquery.showloading-v1.0.jt.js']); //used pretty early in process..
app.rq.push(['script',0,app.vars.baseURL+'resources/jquery.ui.anyplugins.js']); //in zero pass in case product page is first page.
app.rq.push(['css',1,app.vars.baseURL+'resources/anyplugins.css']);

app.rq.push(['script',0,app.vars.baseURL+'resources/load-image.min.js']); //in zero pass in case product page is first page.
app.rq.push(['script',0,app.vars.baseURL+'resources/jquery.image-gallery.jt.js']); //in zero pass in case product page is first page.

app.rq.push(['script',0,app.vars.baseURL+'carouFredSel-6.1.0/jquery.carouFredSel-6.1.0-packed.js']);
app.rq.push(['script',0,app.vars.baseURL+'carouFredSel-6.1.0/jquery.carouFredSel-6.1.0.js']);

//app.rq.push(['script',0,app.vars.baseURL+'resources/jquery.infinitecarousel3.min.js']); //light infinite carousel for prod pages (replaces imgSlider)
app.rq.push(['script',0,app.vars.baseURL+'resources/jquery.infinitecarousel3.js']); //light infinite carousel for prod pages (replaces imgSlider)


//add tabs to product data.
//tabs are handled this way because jquery UI tabs REALLY wants an id and this ensures unique id's between product
app.rq.push(['templateFunction','productTemplate','onCompletes',function(P) {
	var $context = $(app.u.jqSelector('#',P.parentID));
	var $tabContainer = $( ".tabbedProductContent",$context);
		if($tabContainer.length)	{
			if($tabContainer.data("widget") == 'anytabs'){} //tabs have already been instantiated. no need to be redundant.
			else	{
				$tabContainer.anytabs();
				}
			}
		else	{} //couldn't find the tab to tabificate.
	}]);

app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(P) { 
	if(!$('#homepageTabs').hasClass('anytabs')){
		$('#homepageTabs').addClass('anytabs').anytabs();
		}
	if(!$('#homepageBottomTabs').hasClass('anytabs')){
		$('#homepageBottomTabs').addClass('anytabs').anytabs();
		}
	if(!$('#homepageSizingTabs').hasClass('anytabs')){
		$('#homepageSizingTabs').addClass('anytabs').anytabs();
		}
	}]);

  app.rq.push(['templateFunction','companyTemplate','onCompletes',function(P) { 
 if(!$('#homepageBottomTabs').hasClass('anytabs')){
  $('#homepageBottomTabs').addClass('anytabs').anytabs();
  }
 }]);


//sample of an onDeparts. executed any time a user leaves this page/template type.
//app.rq.push(['templateFunction','homepageTemplate','onDeparts',function(P) {app.u.dump("just left the homepage")}]);
/*
app.rq.push(['templateFunction','productTemplate','onCompletes',function(P) {
	if(app.data.cartDetail && app.data.cartDetail.ship && app.data.cartDetail.ship.postal)	{
		app.ext.myRIA.u.fetchTimeInTransit($(app.u.jqSelector('#',P.parentID)),new Array(P.pid));
		}
	}]);
*/

//group any third party files together (regardless of pass) to make troubleshooting easier.


/*
This function is overwritten once the controller is instantiated. 
Having a placeholder allows us to always reference the same messaging function, but not impede load time with a bulky error function.
*/
app.u.throwMessage = function(m)	{
	alert(m); 
	}

app.u.howManyPassZeroResourcesAreLoaded = function(debug)	{
	var L = app.vars.rq.length;
	var r = 0; //what is returned. total # of scripts that have finished loading.
	for(var i = 0; i < L; i++)	{
		if(app.vars.rq[i][app.vars.rq[i].length - 1] === true)	{
			r++;
			}
		if(debug)	{app.u.dump(" -> "+i+": "+app.vars.rq[i][2]+": "+app.vars.rq[i][app.vars.rq[i].length -1]);}
		}
	return r;
	}


//gets executed once controller.js is loaded.
//check dependencies and make sure all other .js files are done, then init controller.
//function will get re-executed if not all the scripts in app.vars.scripts pass 1 are done loading.
//the 'attempts' var is incremented each time the function is executed.

app.u.initMVC = function(attempts){
//	app.u.dump("app.u.initMVC activated ["+attempts+"]");
	var includesAreDone = true,
	percentPerInclude = (100 / app.vars.rq.length),   //what percentage of completion a single include represents (if 10 includes, each is 10%).
	resourcesLoaded = app.u.howManyPassZeroResourcesAreLoaded(),
	percentComplete = Math.round(resourcesLoaded * percentPerInclude); //used to sum how many includes have successfully loaded.

//make sure precentage is never over 100
	if(percentComplete > 100 )	{
		percentComplete = 100;
		}

	//$('#appPreViewProgressBar','#appPreView').val(percentComplete);
	//$('#appPreViewProgressText','#appPreView').empty().append(percentComplete+"% Complete");
    $('#progressBar').stop().animate({"width": percentComplete+"%"},100);
	$('#progressText').empty().append("PLEASE WAIT WHILE YOUR SHOPPING EXPERIENCE LOADS");

	if(resourcesLoaded == app.vars.rq.length)	{
app.u.dump('--* start of if resourcesLoaded == app.vars.rq.length'); app.u.dump(localStorage.appPreferences); app.u.dump(localStorage.loadDirectly);
		//app.preferenceSelected = !(typeof localStorage.appPreferences==="undefined");
		app.preferenceSelected = false;

			//check the url hash to see if a redirect to secure is where we came from. This will prevent preview from loading again since user has already seen it.
		var hashCombo = document.location.hash.split('?');
		if(hashCombo != "") {
			app.u.dump('--> the location is:'); app.u.dump(hashCombo);
			var loadDirectly = hashCombo[hashCombo.length-1].split('&')[0];
			var appPreferences = hashCombo[hashCombo.length-1].split('&')[1];
			app.u.dump(loadDirectly); app.u.dump(appPreferences);
			localStorage.setItem('loadDirectly',loadDirectly);
			localStorage.setItem('appPreferences',appPreferences);
			//var loadDirectly = document.location.hash.indexOf('loadDirectly') > -1 ? true : false;
			//app.u.dump('--> the location is:'); app.u.dump(loadDirectly); app.u.dump(document.location.hash);
		}
		
		if(localStorage.appPreferences == "signedUp" || localStorage.appPreferences == "signMeUp" || localStorage.appPreferences == "logMeIn") {
			loadDirectly = true;
		}
		
			//check if the appPreview has been loaded already and bypass if so (allows switch between http & https to happen w/out seeing appPreview twice).
		if(loadDirectly || localStorage.loadDirectly == true) {
			app.preferenceSelected = true;
			app.u.dump('--* if loadDirectly...'); app.u.dump(app.preferenceSelected);
		}
		else {
			localStorage.setItem('loadDirectly',true);
			app.u.dump('--* else loadDirecty'); app.u.dump(localStorage.loadDirectly);
		}
		
		
			//if there is a preference the app is gonna load, but if not show the buttons that will let user select a preference
		if(app.preferenceSelected){
		//	$(".showWithPreferences").removeClass('displayNone');
		} else {
			$(".showSansPreferences").removeClass('displayNone');
			$(".previewButtonCont").hide();
			//$("#previewContent").hide().delay(200).fadeIn(800);
			$('#progressBarContainer').fadeOut(1000);
			setTimeout( function() {
				$(".previewButtonCont").delay(300).fadeIn({duration: 500});
			}, 1000);
		}
			
			
			//wait to load app if preferenceSelected isn't true here
		app.u.dump("Preference Selected? "+app.preferenceSelected);
		if(app.preferenceSelected == true){
			app.u.loadApp();
		} else {
			app.loadOnSelect = true;
		}
	}
	else if(attempts > 250)	{
		app.u.dump("WARNING! something went wrong in init.js");
		//this is 10 seconds of trying. something isn't going well.
		$('#appPreView').empty().append("<div class='uhOh'><h2>Uh Oh. Something seems to have gone wrong. </h2><p>Several attempts were made to load the store but some necessary files were not found <br> or could not load. We apologize for the inconvenience.</p><p>Please try 'refresh' and see if that helps.<br><b>If the error persists, please contact the site administrator</b><br> - dev: see console.</p></div>");
		app.u.howManyPassZeroResourcesAreLoaded(true);
		}
	else	{
		setTimeout("app.u.initMVC("+(attempts+1)+")",250);
		}
	}
	
	
	app.u.selectPreference = function(preference, save){
		if(!app.preferenceSelected){
			app.preferenceSelected = true;
			if(typeof preference !== "undefined"){
				app.u.dump("Preference Selected: " + preference);
				if(save){
					app.u.myPref = preference;
						app.u.dump('--* selectPreference app.u.myPref='); app.u.dump(app.u.myPref);
					localStorage.setItem('appPreferences',preference);
						app.u.dump('--* app.u.selectpreferance:'); app.u.dump(preference);
						
						setTimeout(function(){app.u.dump('timing out');},30000);
				} else {
					//don't save the preference to cookie
				}
			}
		//	$(".showWithPreferences").removeClass('displayNone');
		//	$(".showSansPreferences").addClass('displayNone');
			if(app.loadOnSelect){
				app.u.loadApp();
			}
		} else {
			//app preference is already set, don't do it again! (might screw with the loading process)
		}
	}
	
		//will read cookies here so can be used before signup extension is loaded
	readCookie = function getCookie(cname) {
		var value = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) 
		  {
		  var c = ca[i].trim();
		  if (c.indexOf(value)==0) return c.substring(value.length,c.length);
		  }
		return "";
	}
	
	writeCookie = function setCookie(cname,cvalue,exdays) {
		var d = new Date();
		d.setTime(d.getTime()+(exdays*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = cname+"="+cvalue+"; "+expires;
	}
		

//app.u.skipPreference = function(){
//	app.u.selectPreference(undefined);
//}


app.u.loadApp = function() {
//instantiate controller. handles all logic and communication between model and view.
//passing in app will extend app so all previously declared functions will exist in addition to all the built in functions.
//tmp is a throw away variable. app is what should be used as is referenced within the mvc.
	app.vars.rq = null; //to get here, all these resources have been loaded. nuke record to keep DOM clean and avoid any duplication.
	var tmp = new zController(app);
//instantiate wiki parser.
	myCreole = new Parse.Simple.Creole();
	}


//Any code that needs to be executed after the app init has occured can go here.
//will pass in the page info object. (pageType, templateID, pid/navcat/show and more)
app.u.appInitComplete = function(P)	{
app.u.dump(P);
	app.u.dump('--* IN APPINITCOMPLETE'); app.u.dump(localStorage.appPreferences); app.u.dump(localStorage.loadDirectly);
	if(app.preferenceSelected == true) {
	//	switch(localStorage.appPreferences) {
		switch(app.u.myPref) {
			case "guest" :  //will need to see message next time
				app.u.dump('--* IN GUEST');
				localStorage.removeItem('appPreferences'); 
				localStorage.setItem('loadDirectly',false);
				break;
			case "signMeUp" : //load direct in case transfer to secure happens
				app.u.dump('--* IN SIGN ME UP');
				localStorage.setItem('appPreferences',app.u.myPref); 
				localStorage.setItem('loadDirectly',true);
				return app.ext.store_bmo.a.showAccountCreate();
				break;
			case "logMeIn" : //load direct in case transfer to secure happens
				app.u.dump('--* IN LOG ME IN'); app.u.dump(localStorage.appPreferences); 
				localStorage.setItem('appPreferences',app.u.myPref); 
				localStorage.setItem('loadDirectly',true);
				app.u.dump(localStorage.appPreferences);
				return showContent('customer',{'show':'myaccount'});
				break;
		//	default : //must have an account already
		//		app.u.dump('--* IN DEFALUT');
		//		localStorage.setItem('loadDirectly',true);
		}
	}
}



//don't execute script till both jquery AND the dom are ready.
$(document).ready(function(){
	app.u.handleRQ(0)
	});






