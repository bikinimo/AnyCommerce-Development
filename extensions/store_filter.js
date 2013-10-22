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


var store_filter = function() {
	var theseTemplates = new Array('');
	var r = {
	
		vars : {
			'templates' : []
		},

		
////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

	//store_search contains the maintained elastic query search. use that.
	calls : {}, //calls
	
	//key is safe id. value is name of the filter form.
	filterMap : {
	
		".01-new-2012-bikinis":{ //category for filter
			"filter": "bikiniSetsForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".96-sexy-pajamas":{ //category for filter
			"filter": "separatesForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".02-tankinis":{ //category for filter
			"filter": "tankinisForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".015-swimdress":{ //category for filter
			"filter": "tankinisForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".85-one-piece-swimwear":{ //category for filter
			"filter": "onePiecesForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".45-solid-color-swimsuits":{ //category for filter
			"filter": "solidColorsForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".90-cover-up-swimwear":{ //category for filter
			"filter": "tankinisForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".96-sexy-pajamas":{ //category for filter
			"filter": "tankinisForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
		".95-swim-dress-swimwear":{ //category for filter
			"filter": "tankinisForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
	
	},//

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
			//	app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj) {
			//		app.u.dump('Store_filter started');
			//	}]);
				
				
				//Filter Search:
				app.rq.push(['templateFunction','categoryTemplate','onCompletes',function(infoObj) {
					//context for reset button to reload page
					var $context = $(app.u.jqSelector('#',infoObj.parentID)); 
					
					app.u.dump("BEGIN categoryTemplate onCompletes for filtering");
					if(app.ext.store_filter.filterMap[infoObj.navcat]) {
						app.u.dump(" -> safe id DOES have a filter.");
						
						app.ext.store_filter.u.changeLayoutToFilter($context);

						var $page = $(app.u.jqSelector('#',infoObj.parentID));
						app.u.dump(" -> $page.length: "+$page.length);
						if($page.data('filterAdded'))	{app.u.dump("filter exists skipping form add");} //filter is already added, don't add again.
						else {
							$page.data('filterAdded',true)
							var $form = $("[name='"+app.ext.store_filter.filterMap[infoObj.navcat].filter+"']",'#appFilters').clone().appendTo($('.filterContainer',$page));
							$form.on('submit.filterSearch',function(event) {
								event.preventDefault()
								app.u.dump(" -> Filter form submitted.");
								app.ext.store_filter.a.execFilter($form,$page);
							});

							if(typeof app.ext.store_filter.filterMap[infoObj.navcat].exec == 'function') {
								app.ext.store_filter.filterMap[infoObj.navcat].exec($form,infoObj)
							}

							//make all the checkboxes auto-submit the form.
							$(":checkbox",$form).off('click.formSubmit').on('click.formSubmit',function() {
								$form.submit();      
							});
						}
					}
						
					//selector for reset button to reload page
					$('.resetButton', $context).click(function(){
						$context.empty().remove();
						showContent('category',{'navcat':infoObj.navcat});
					});

				}]);
				
				
				//if there is any functionality required for this extension to load, put it here. such as a check for async google, the FB object, etc. return false if dependencies are not present. don't check for other extensions.
				r = true;
				
				
				return r;
			},
			onError : function() {
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN app.ext.store_filter.callbacks.init.onError');
			}
		}
			
			
	}, //callbacks
		
		
		
////////////////////////////////////   getFilterObj    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


		getElasticFilter : {

			slider : function($fieldset) {
				var r = false; //what is returned. Will be set to an object if valid.
				var $slider = $('.slider-range',$fieldset);
				if($slider.length > 0) {
					r = {"range":{}}
					//if data-min and/or data-max are not set, use the sliders min/max value, respectively.
					r.range[$fieldset.attr('data-elastic-key')] = {
						"from" : $slider.slider('values', 0 ) * 100,
						"to" : $slider.slider("values",1) * 100
					}
				}
				else {
					app.u.dump("WARNING! could not detect .ui-slider class within fieldset for slider filter.");
				}
				return r;
			}, //slider

			hidden : function($fieldset) {
				return app.ext.store_filter.u.buildElasticTerms($("input:hidden",$fieldset),$fieldset.attr('data-elastic-key'));
			},
			
			checkboxes : function($fieldset) {
				return app.ext.store_filter.u.buildElasticTerms($(':checked',$fieldset),$fieldset.attr('data-elastic-key'));
			} //checkboxes

		}, //getFilterObj



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
		
			execFilter : function($form,$page) {

				app.u.dump("BEGIN store_filter.a.filter");
				var $prodlist = $("[data-app-role='productList']",$page).first().empty();

				$('.categoryList',$page).hide(); //hide any subcategory lists in the main area so customer can focus on results
				$('.categoryText',$page).hide(); //hide any text blocks.

				if(app.ext.store_filter.u.validateFilterProperties($form)) {
				//	app.u.dump(" -> validated Filter Properties.")
					var query = {
						"mode":"elastic-native",
						"size":50,
						"filter" : app.ext.store_filter.u.buildElasticFilters($form)
					}//query
					
					//app.u.dump(" -> Query: "); app.u.dump(query);
					if(query.filter.and.length > 0)	{
						$prodlist.addClass('loadingBG');
						app.ext.store_search.calls.appPublicProductSearch.init(query,{'callback':function(rd){

							if(app.model.responseHasErrors(rd)) {
								$page.anymessage({'message':rd});
							}
							else {
								var L = app.data[rd.datapointer]['_count'];
								$prodlist.removeClass('loadingBG')
								if(L == 0) {
									$page.anymessage({"message":"Your query returned zero results."});
								}
								else {
									$prodlist.append(app.ext.store_search.u.getElasticResultsAsJQObject(rd));
								}
							}

						//},'datapointer':'appPublicSearch|elasticFiltering','templateID':'productListTemplateResultsNoPreview'});
						},'datapointer':'appPublicSearch|elasticFiltering','templateID':'productListTemplateResults'});
						
						app.model.dispatchThis();
					}
					else {
						$page.anymessage({'message':"Please make some selections from the list of filters"});
					}
				}
				else {
					$page.anymessage({"message":"Uh Oh! It seems an error occured. Please try again or contact the site administator if error persists."});
				}
				
				$('html, body').animate({scrollTop : 0},200); //new page content loading. scroll to top.

		},//filter
			
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
		
			changeLayoutToFilter : function($context) {
				$context.css('display','inline-block');
				$('.catContainer',$context).css({'width':'777px','float':'left'});
			},
		
			//pass in form as object.  This function will verify that each fieldset has the appropriate attributes.
			//will also verify that each filterType has a getElasticFilter function.
			validateFilterProperties : function($form) {
				var r = true, //what is returned. false if form doesn't validate.
				$fieldset, filterType; //recycled.

				$('fieldset',$form).each(function(index) {
					$fieldset = $(this);
					filterType = $fieldset.attr('data-filtertype');
					if(!filterType) {
						r = false;
						$form.anymessage({"message":"In store_filters.u.validateFilterProperties,  no data-filtertype set on fieldset. can't include as part of query. [index: "+index+"]",gMessage:true});
					}
					else if(typeof app.ext.store_filter.getElasticFilter[filterType] != 'function')	{
						r = false;
						$form.anymessage({"message":"WARNING! type ["+filterType+"] has no matching getElasticFilter function. [typoof: "+typeof app.ext.store_filter.getElasticFilter[filterType]+"]",gMessage:true});
					}
					else if(!$fieldset.attr('data-elastic-key')) {
						r = false;
						$form.anymessage({"message":"WARNING! data-elastic-key not set for filter. [index: "+index+"]",gMessage:true});
					}
					else {
						//catch.
					}
				});
				return r;
			},
			
			
			buildElasticFilters : function($form) {

				var filters = {
					"and" : [] //push on to this the values from each fieldset.
				}//query

				$('fieldset',$form).each(function() {
					var $fieldset = $(this),
					filter = app.ext.store_filter.getElasticFilter[$fieldset.attr('data-filtertype')]($fieldset);
					if(filter) {
						filters.and.push(filter);
					}
				});
				
				// 20120701 -> do not want discontinued items in the layered search results. JT.
				filters.and.push({"not" : {"term" : {"tags":"IS_DISCONTINUED"}}});
					
				//and requires at least 2 inputs, so add a match_all.
				//if there are no filters, don't add it. the return is also used to determine if any filters are present
				if(filters.and.length == 1)	{
					filters.and.push({match_all:{}})
				}
				
				return filters;				
			},
			
			
			//pass in a jquery object or series of objects for form inputs (ex: $('input:hidden')) and a single term or a terms object will be returned.
			//false is returned in nothing is checked/selected.
			//can be used on a series of inputs, such as hidden or checkbox 
			buildElasticTerms : function($obj,attr)	{
	app.u.dump('Filter Attribute:'); app.u.dump(attr);
				var r = false; //what is returned. will be term or terms object if valid.
				if($obj.length == 1) {
					r = {term:{}};
					r.term[attr] = (attr == 'pogs') ? $obj.val() : $obj.val().toLowerCase(); //pog searching is case sensitive.
				}
				else if($obj.length > 1) {
					r = {terms:{}};
					r.terms[attr] = new Array();
					$obj.each(function() {
						r.terms[attr].push((attr == pogs) ? $(this).val() : $(this).val().toLowerCase());
					});
				}
				else {
					//nothing is checked.
				}
				
				return r;
			},
			
			
			renderSlider : function($form, infoObj, props) {
				$( ".slider-range" ).slider({
					range: true,
					min: props.MIN,
					max: props.MAX,
					values: [ props.MIN, props.MAX ],
					stop : function(){
						$form.submit();
						},
					slide: function( event, ui ) {
						$( ".sliderValue",$form ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
					}
				});
				
				$( ".sliderValue",$form ).val( "$" + $( ".slider-range" ).slider( "values", 0 ) + " - $" + $( ".slider-range" ).slider( "values", 1 ) );
			}, //renderSlider
						
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