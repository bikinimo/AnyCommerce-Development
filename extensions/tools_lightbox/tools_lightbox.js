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



//	Intended as a free, open source alternative to 3rd party plugins like Magic Zoom Plus.
//	Utilizes the Lightbox 2 jQuery plugin: http://lokeshdhakar.com/projects/lightbox2/

var tools_lightbox = function(_app) {
	var r = {
	callbacks : {
		init : {
			onSuccess : function()	{
				var r = false;
				
				_app.u.loadResourceFile(['script',0,'extensions/tools_lightbox/lightbox/js/lightbox.js']);
				_app.u.loadResourceFile(['css',0,'extensions/tools_lightbox/lightbox/css/lightbox.css','css-lightbox']);
				//_app.u.loadResourceFile(['css',0,'extensions/tools_lightbox/lightbox/css/screen.css','lightbox-screen']);
				
				r = true;

				return r;
				},
			onError : function()	{
				_app.u.dump('BEGIN tools_lightbox.callbacks.init.onError');
				}
			}
		}, //callbacks

		a : {

			}, //a [actions]

		renderFormats : {
			
/****************************************
A renderformat for creating a lightbox link completely agnostic of data-object that is being passed into it.

This renderformat is intended to be on a link tag around a typical img tag bound by imageURL.
ex: 
<a data-bind="useParentData:true; format:lightboxLink; extension:tools_lightbox; hrefAttr:%attribs.zoovy:prod_image1;">
	<img src='blank.gif' class='prodBigImage' data-bind='var: product(zoovy:prod_image1); format:imageURL;' width='296' height='296' />
</a>

Do not specify a var, ALWAYS set useParentData to true.

bindData params:
required:
	hrefAttr - a dot-notation path for de-referencing the image path from the parent data- ex: "%attribs.zoovy:prod_image1"
optional:
	w - A width to be passed to the _app.u.makeImage call
	h - A height to be passed to the _app.u.makeImage call
	b - A background color to be passed to the _app.u.makeImage call
	
	groupingAttr - a dot-notation path for de-referencing an attribute for grouping- ex: "pid" for a simple bind to a product ID.
	groupingPrefix - a prefix that will be attached to the groupingAttr.  For separating groups by instance- prodlist vs. product page for example
!!!!!!!! NOTE: multiple prodlist entries with the same product (or catList with cats) will repeat prefix- may need to update this later
	
	titleAttr - a dot-notation path for de-referencing an attribute for title- ex: "%attribs.zoovy:prod_name"
****************************************/
			lightboxLink: function($tag,data){
			
					//bikinimo requires images be added here so check for square size condition can be made (that is why there is no <img> in index)
				if(data.value['%attribs'] && data.bindData.hrefAttr) { 
					var pdata = data.value['%attribs'];
					var width = data.bindData.width;
					var height = data.bindData.height;
					
					pdata['user:is_square'] ? height = width : height = height; //make it square if the square attrib is there
						//after height is determined to be square or not, add image in with the dimensions found.
					var attrib = data.bindData.hrefAttr.split('.')[0];
					var zoovyImage = data.bindData.hrefAttr.split('.')[1];
					if(data.value[attrib][zoovyImage]) {
						$tag.show();
						$tag.append(_app.u.makeImage({"name":data.value[attrib][zoovyImage],"w":width,"h":height,"b":"FFFFFF","tag":1}));
					}
				}
			
				if(!data.bindData.hrefAttr){
					_app.u.dump("-> tools_lightbox.renderFormats.lightboxLink NO HREFATTR SPECIFIED");
					return false;
					}
				else {
					var hrefAttr = data.value;
					var hrefParams = data.bindData.hrefAttr.split('.');
					
					for(var index in hrefParams){
						if(hrefAttr[hrefParams[index]]){
							hrefAttr = hrefAttr[hrefParams[index]];
							}
						else {
							hrefAttr = false;
							break;
							}
						}
					
					if(!hrefAttr){
						_app.u.dump("-> tools_lightbox.renderFormats.lightboxLink HREFATTR COULD NOT BE INTERPOLATED FROM DATA OBJECT");
						return false;
						}
					else {
						var imgObj = {
							name : hrefAttr
							};
						if(data.bindData.w){ imgObj.w = data.bindData.w; }
/*specific to bmo*/		if(data.bindData.h && pdata['user:is_square']){ imgObj.h = data.bindData.w; }else{ imgObj.h = data.bindData.h; }
						if(data.bindData.b){ imgObj.b = data.bindData.b; }
						
						var href = _app.u.makeImage(imgObj);
						
						var rel= 'lightbox';
						if(data.bindData.groupingAttr){
							var groupingAttr = data.value;
							var groupingParams = data.bindData.groupingAttr.split('.');
							
							for(var index in groupingParams){
								if(groupingAttr[groupingParams[index]]){
									groupingAttr = groupingAttr[groupingParams[index]];
									}
								else {
									groupingAttr = false;
									break;
									}
								}
							if(groupingAttr){
								rel += "[";
								if(data.bindData.groupingPrefix){
									rel += data.bindData.groupingPrefix;
									}
								rel += groupingAttr;
								rel += "]";								
								}
						
						
							}
						
						var title = false;
						if(data.bindData.titleAttr){
							var titleAttr = data.value;
							var titleParams = data.bindData.titleAttr.split('.');
							
							for(var index in titleParams){
								if(titleAttr[titleParams[index]]){
									titleAttr = titleAttr[titleParams[index]];
									}
								else {
									titleAttr = false;
									break;
									}
								}
							if(titleAttr){
								title = titleAttr;							
								}
						
						
							}
						
						$tag.attr('href', href);
						$tag.attr('rel', rel);
						if(title){
							$tag.attr('title', title);
							}
						}
					}
				}
			}, //renderFormats

		u : {
			} //u [utilities]

		} //r object.
	return r;
	}