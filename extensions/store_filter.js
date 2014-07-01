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


var store_filter = function(_app) {
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
	
		".app-categories.bikini_sets":{ //category for filter
			"filter": "bikiniSetsForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.triggerBox($form);
			}
		},
		
			//display for bottoms in this category is allowed through css override of hideFromList() function
		".app-categories.separates":{ //category for filter
			"filter": "separatesForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.triggerBox($form);
			}
		},
		
		".app-categories.tankinis":{ //category for filter
			"filter": "sizesFormAY00",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'tankini');
			}
		},
		
		".app-categories.swim_dresses":{ //category for filter
			"filter": "sizesFormAY00",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'swim+dresse');
			}
		},
		
		".app-categories.one_pieces":{ //category for filter
			"filter": "onePiecesForm",	//name of filter form to use for this category
			"exec" : function($form,infoObj) {_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
		},
		
	//	".45-solid-color-swimsuits":{ //category for filter
	//		"filter": "solidColorsForm",	//name of filter form to use for this category
	//		"exec" : function($form,infoObj){app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});}
	//	},
		
		"._app-categories.cover_ups":{ //category for filter
			"filter": "sizesFormA814",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'coverup');
			}
		},
		
		".app-categories.dresses":{ //category for filter
			"filter": "sizesFormA814",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'dress');
			}
		},
		
		".app-categories.sleepwear":{ //category for filter
			"filter": "sizesFormA814",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'sleepwear');
			}
		},
		
		".app-categories.accessories":{ //category for filter
			"filter": "sizesFormA814",	//name of filter form to use for this category
			"exec" : function($form,infoObj){
				_app.ext.store_filter.u.renderSlider($form, infoObj, {MIN:0,MAX:300});
				_app.ext.store_filter.u.renderHiddenField($form, 'accessorie');
			}
		},
	
	},//

	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
			//	_app.rq.push(['templateFunction','homepageTemplate','onCompletes',function(infoObj) {
			//		_app.u.dump('Store_filter started');
			//	}]);
				
				
				//Filter Search:
				_app.rq.push(['templateFunction','categoryTemplate','onCompletes',function(infoObj) {
					//context for reset button to reload page
					var $context = $(_app.u.jqSelector('#',infoObj.parentID)); 
					
					_app.u.dump("BEGIN categoryTemplate onCompletes for filtering");
					if(_app.ext.store_filter.filterMap[infoObj.navcat]) {
						_app.u.dump(" -> safe id DOES have a filter.");
						
						_app.ext.store_filter.u.changeLayoutToFilter($context);

						var $page = $(_app.u.jqSelector('#',infoObj.parentID));
						_app.u.dump(" -> $page.length: "+$page.length);
						if($page.data('filterAdded'))	{_app.u.dump("filter exists skipping form add");} //filter is already added, don't add again.
						else {
							$page.data('filterAdded',true)
							var $form = $("[name='"+_app.ext.store_filter.filterMap[infoObj.navcat].filter+"']",'#appFilters').clone().appendTo($('.filterContainer',$page));
							$form.on('submit.filterSearch',function(event) {
								event.preventDefault()
								_app.u.dump(" -> Filter form submitted.");
								_app.ext.store_filter.a.execFilter($form,$page);
									//put a hold on infinite product list and hide loadingBG for it
								$page.find("[data-app-role='productList']").data('filtered',true);
								$page.find("[data-app-role='infiniteProdlistLoadIndicator']").hide();
							});

							if(typeof _app.ext.store_filter.filterMap[infoObj.navcat].exec == 'function') {
								_app.ext.store_filter.filterMap[infoObj.navcat].exec($form,infoObj)
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
				_app.u.dump('BEGIN app.ext.store_filter.callbacks.init.onError');
			}
		}
			
			
	}, //callbacks
		
		
		
////////////////////////////////////   getFilterObj    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


		getElasticFilter : {

			slider : function($fieldset, mKey) {
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
					_app.u.dump("WARNING! could not detect .ui-slider class within fieldset for slider filter.");
				}
				return r;
			}, //slider

			hidden : function($fieldset, mKey) {
				if(mKey == 0) {	
					return _app.ext.store_filter.u.buildElasticTerms($("input:hidden",$fieldset),$fieldset.attr('data-elastic-key'));
				}
				else {
					return _app.ext.store_filter.u.buildMultiElasticTerms($("input:hidden",$fieldset),$fieldset.attr('data-elastic-key'));
				}
			}, //hidden
			
			checkboxes : function($fieldset, mKey) {
				if (mKey == 0) {
					return _app.ext.store_filter.u.buildElasticTerms($(':checked',$fieldset),$fieldset.attr('data-elastic-key'));
				}
				else {
					return _app.ext.store_filter.u.buildMultiElasticTerms($(':checked',$fieldset),$fieldset.attr('data-elastic-key'));
				}
			}, //checkboxes
			
	/*		multi_key_checkboxes : function($fieldset, multiElasticKey) {
				return _app.ext.store_filter.u.buildElasticTerms($(':checked',$fieldset),multiElasticKey);
			} //multi_key_checkboxes
*/
		}, //getFilterObj



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
		
			execFilter : function($form,$page) {

				_app.u.dump("BEGIN store_filter.a.filter");
				var $prodlist = $("[data-app-role='productList']",$page).first().empty();

				$('.categoryList',$page).hide(); //hide any subcategory lists in the main area so customer can focus on results
				$('.categoryText',$page).hide(); //hide any text blocks.
//				_app.u.dump('_app.ext.store_filter.u.buildElasticFilters($form)'); _app.u.dump(_app.ext.store_filter.u.buildElasticFilters($form));
				if(_app.ext.store_filter.u.validateFilterProperties($form)) {
					_app.u.dump(" -> validated Filter Properties.")
					var query = {
						"mode":"elastic-native",
						"size":100,
						"filter" : _app.ext.store_filter.u.buildElasticFilters($form)
					}//query
					
					_app.u.dump(" -> Query: "); _app.u.dump(query);
					if(query.filter.and.length > 0 || query.filter.and.filters.length > 0)	{
						$prodlist.addClass('loadingBG');
						_app.ext.store_search.calls.appPublicProductSearch.init(query,{'callback':function(rd){

							if(_app.model.responseHasErrors(rd)) {
								$page.anymessage({'message':rd});
							}
							else {
								var L = _app.data[rd.datapointer]['_count'];
								$prodlist.removeClass('loadingBG')
								if(L == 0) {
									$page.anymessage({"message":"Your query returned zero results."});
								}
								else {
									$prodlist.append(_app.ext.store_search.u.getElasticResultsAsJQObject(rd));
								}
							}

						//},'datapointer':'appPublicSearch|elasticFiltering','templateID':'productListTemplateResultsNoPreview'});
						},'datapointer':'appPublicSearch|elasticFiltering','templateID':'productListTemplateResults'});
						
						_app.model.dispatchThis();
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
		
				//a checkbox that is triggered to initially submit the form and load the filter search 
				//w/ all item_category items for attrib. indicated on input.
			triggerBox : function($form) {
					//no timeout triggered check to early
				setTimeout(function(){$('.triggerBox', $form).trigger('click');},250);
			},
		
				//adds hidden field to limit filter results to category filter is in
				//allows a different app_category value to be passed for use w/ different forms.
			renderHiddenField : function($form, app_categoryValue) {
				if($form) {
					//app.u.dump('--> Hidden field navcat'); app.u.dump(app_categoryValue);
					var $fieldset = "<fieldset class='displayNone' data-elastic-key='item_category1 item_category2 item_category3 item_category4 item_category5 item_category6 item_category7 item_category8' data-filtertype='hidden'><input type='hidden' name='h-' value='"+app_categoryValue+"' /></fieldset>";
					$form.append($fieldset);
				}
			},
		
				//pre-checks the entire form before filters are built to indicate whether or not to use OR query 
				//returns true if OR structure is needed, false if not.
			checkElasticForm : function($form) {
			
					//check each fieldset in the form to see if it's elastic key has more than one attribute
				var count = 0;
				$('fieldset',$form).each(function() {
					var $fieldset = $(this);
					var multipleKey = $fieldset.attr('data-elastic-key').split(" ").length;
						//if a multiple elastic key is found increment the count for later examination under oath
//					_app.u.dump('checkElasticForm var multipleKey'); _app.u.dump(multipleKey);					
					if($("input[type='checkbox']",$fieldset).is(":checked") && multipleKey > 1) {
						count++;
					}	
					else if ($("input[type='hidden']",$fieldset) && multipleKey > 1) {
						count++
					}
				});
				
//				_app.u.dump('checkElasticForm var count'); _app.u.dump(count);
					//if the count has been incremented, there is a multiple key and the filter will be constructed accordingly
				if(count != 0) { 
//				_app.u.dump('returned true');
					return true;
				}
				else {
//				_app.u.dump('returned false');
					return false;
				}
			},
		
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
					else if(typeof _app.ext.store_filter.getElasticFilter[filterType] != 'function')	{
						r = false;
						$form.anymessage({"message":"WARNING! type ["+filterType+"] has no matching getElasticFilter function. [typoof: "+typeof _app.ext.store_filter.getElasticFilter[filterType]+"]",gMessage:true});
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
					//if multiple elastic keys are used the query must be structured differently
				if(_app.ext.store_filter.u.checkElasticForm($form)) {
					var filters = {
						"and" : {
							"filters" : []  //push on to this the values from each fieldset.
						}
					}//query
					var mKey = 1; //passed w/ fieldsets to indicate query will have OR structure
				}
				else {
					var filters = {
						"and" : [], //push on to this the values from each fieldset.
					}//query
					var mKey = 0; //passed w/ fieldsets to indicate query will just have and structure, no OR
				}
//				_app.u.dump('buildElasticFilters var mKey'); _app.u.dump(mKey); 
				
				$('fieldset',$form).each(function() {
					var $fieldset = $(this);
					filter = _app.ext.store_filter.getElasticFilter[$fieldset.attr('data-filtertype')]($fieldset, mKey);
					if(filter && mKey == 0) {
						filters.and.push(filter);
					}
					else if (filter && mKey == 1) {
						filters.and.filters.push(filter);
					}
				});
				
				// 20120701 -> do not want discontinued items in the layered search results. JT.
				//add based on whether multiple keys are used or not
				if(mKey == 0) {
					filters.and.push({"not" : {"term" : {"tags":"IS_DISCONTINUED"}}});
				}
				else {
					filters.and.filters.push({"not" : {"term" : {"tags":"IS_DISCONTINUED"}}});
				}
				//and requires at least 2 inputs, so add a match_all
				//if there are no filters, don't add it. the return is also used to determine if any filters are present
				//add based on whether multiple keys are used or not
				if(mKey == 0) {
					if(filters.and.length == 1)	{
						filters.and.push({match_all:{}})
					}
				}
				else {
					if(filters.and.filters.length == 1)	{
						filters.and.filters.push({match_all:{}})
					}
				}
				
				return filters;				
			},
			
			
			//pass in a jquery object or series of objects for form inputs (ex: $('input:hidden')) and a single term or a terms object will be returned.
			//false is returned in nothing is checked/selected.
			//can be used on a series of inputs, such as hidden or checkbox 
			buildElasticTerms : function($obj,attr)	{
			
				var r = false; //what is returned. will be term or terms object if valid.
		
					if($obj.length == 1) {
						r = {term:{}};
						r.term[attr] = (attr == 'pogs') ? $obj.val() : $obj.val().toLowerCase(); //pog searching is case sensitive.
					}
					else if($obj.length > 1) {
						r = {terms:{}};
						r.terms[attr] = new Array();
						$obj.each(function() {
							r.terms[attr].push((attr == 'pogs') ? $(this).val() : $(this).val().toLowerCase());
						});
					}
					else {
						//nothing is checked.
					}

				return r;
			},
			
				//works similarly to the buildElasticTerms function above but checks for multiple elastic keys
				//the return and inputs are the same as buildElasticTerms
				//investigate using query over multiple fields:
				// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_multi_field_2
			buildMultiElasticTerms : function($obj,attr)	{
//			_app.u.dump('buildElasticTerms attr'); _app.u.dump(attr);	

				var r = false; //what is returned. will be term or terms object if valid.
				
					//if multiple attribs in elastic key, and something is checked build filter into terms
				if (attr.split(" ").length > 1 && $obj.length > 0) {
					var filterOR = {
						"or" : {
							"filters" : [] 
						},
					}; //filterOR
					
//					_app.u.dump('buildElasticTerms var filterOR'); _app.u.dump(filterOR);
					var multiAttr = attr.split(" "); 	//array of the terms to add
					var count = attr.split(" ").length; //count of attribs in said array
					
						//build a term for each attrib in multiAttr with the same checked value in each
					for (i = 0; i < count; i++) {
						r = {terms:{}};
						r.terms[multiAttr[i]] = new Array();
						$obj.each(function() {
							r.terms[multiAttr[i]].push((multiAttr[i] == 'pogs') ? $(this).val() : $(this).val().toLowerCase());
						});
						filterOR.or.filters.push(r); //add terms to the filter
					}
						//and make filter what's returned
					r = filterOR;
				} //multiple attribs build
				
					//otherwise build term or terms the standard way
				else {
					if($obj.length == 1) {
						r = {term:{}};
						r.term[attr] = (attr == 'pogs') ? $obj.val() : $obj.val().toLowerCase(); //pog searching is case sensitive.
					}
					else if($obj.length > 1) {
						r = {terms:{}};
						r.terms[attr] = new Array();
						$obj.each(function() {
							r.terms[attr].push((attr == 'pogs') ? $(this).val() : $(this).val().toLowerCase());
						});
					}
					else {
						//nothing is checked.
					}
				} //standard terms build

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