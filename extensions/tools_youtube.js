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





var tools_youtube = function(_app) {
	var theseTemplates = new Array('');
	var r = {

	vars : {
		players : {}
		},
	
////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	


	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).

				//_app.u.loadResourceFile(['script',0,'https://www.youtube.com/iframe_api']);
				
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
			test : function(ytVideoID){
				_app.ext.tools_youtube.vars.players[ytVideoID].playVideo();
				},
				
			youtubeIframe : function($context) {
				$('[data-youtubeid]', $context).each(function(){
					var ytVideoID = $(this).attr('data-youtubeid');
					_app.u.dump(ytVideoID);
					if(ytVideoID) {
						//_app.u.dump('--> the video is'); _app.u.dump(_app.ext.tools_youtube.vars.players[ytVideoID]);
						_app.ext.tools_youtube.vars.players[ytVideoID] = new YT.Player(this, {
							height		: '171',
							width		: '305',
							videoId		: ytVideoID,
							playerVars	: {
								modestbranding	: 1,
								rel				: 0,
								showinfo		: 0,
								iv_load_policy	: 3,
								frameborder		: 0,
								alowfullscreen	: 1,
								vq				: 'hd1080'
							},
							events  : {
								'onReady'  : function(e){
									_app.u.dump('player ready');
									_app.ext.tools_youtube.vars.players[ytVideoID].addEventListener('onStateChange', function(e){
										_app.u.dump('state changed to'); _app.u.dump(e.data);
									});
								}
								//'onStateChange' : _app.ext.tools_youtube.u.onPlayerStateChange
							  }
						});
						//_app.u.dump('--> the video is'); _app.u.dump(_app.ext.tools_youtube.vars.players[ytVideoID]);
					}
					
					else {
						_app.u.dump('tools_youtube did not find a video for this item')
					}
				});
			},
			
			onPlayerReady : function(event) {
				_app.u.dump('The player is ready:'); _app.u.dump(event);
			},
			
			onPlayerStateChange : function(event) {
				_app.u.dump('This is the state change:'); _app.u.dump(event);
				if(event.data == 1) {_app.u.dump('Video Playing');}
				if(event.data == 2) {_app.u.dump('Video Paused');}
				if(event.data == 0) {
					_app.u.dump('Video Ended');
			//		var $iFrame = $('iframe', '#product-modal');
			//		var endedVidId = $iFrame.attri('data-youtubeid');
			//		$iFrame.before('<div data-youtubeid="'+endedVidId+'"></div>');
			//		$iFrame.remove();
			//		_app.ext.tools_youtube.u.youtubeIframe($('#product-modal'));
				}
			},
						
			playVideo : function(event){
				event.target.playVideo();
			}
		
		}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			
			//animates height of parent element to reveal additional contents, while hiding action container
			revealParent : function($ele,p) {			
				p.preventDefault();
//				_app.u.dump('open ----------------------------');
				var oHeight = $ele.data('openheight');
				$ele.css('display','none');
				$('span',$ele).css('opacity','0');
				$('.closeVideo',$ele.parent()).css({'display':'block','background-color':'#F05A24'});
				$('.closeVideo span',$ele.parent()).animate({opacity:1},500)
				$ele.parent().animate({height:oHeight + 'px'},1000);
				return false;
			},
			
			//animates height of parent element to hide additional contents, while hiding action container
			compressParent : function($ele,p) {
				p.preventDefault();
//				_app.u.dump('-> close');
				var cHeight = $ele.data('closeheight');
				var ytVideoID = $ele.parent().children('[data-youtubeid]').attr('data-youtubeid');
//				_app.u.dump(ytVideoID);
				$ele.css('display','none');
				$('span',$ele).css('opacity','0');
				$('.openVideo',$ele.parent()).css({'display':'block','background-color':'#54A7E1'});
				$('.openVideo span',$ele.parent()).animate({opacity:1},500)
				$ele.parent().animate({height:cHeight + 'px'},1000);
				_app.ext.tools_youtube.vars.players[ytVideoID].pauseVideo();
				return false;
			},
			
			} //e [app Events]
		} //r object.
	return r;
	}