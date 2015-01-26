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




var bmo_acctcreate = function(_app) {
	var theseTemplates = new Array('');
	var r = {
		
		
////////////////////////////////////   CALLS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	calls : {
		appBuyerCreate : {
				init : function(obj,_tag)	{
					this.dispatch(obj,_tag);
					return 1;
				},
				dispatch : function(obj,_tag){
					obj._tag = _tag || {};
					obj._cmd = "appBuyerCreate";
					_app.model.addDispatchToQ(obj,'immutable');
				}
			}, //appBuyerCreate
		
	}, //calls


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
			
			doSomething : function() {
				dump('SOMETHING IS NOT RIGHT.');
			}
			
		}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		tlcFormats : {
			dump : function(data,thisTLC) {
				dump("&&&&&&&&& Is this what you were looking for?"); dump(data.globals.binds.var);
			}
		},
		
////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {}, //renderFormats
		
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {}, //u [utilities]
		
////////////////////////////////////   EVENTS [e]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			
			//there used to be a copy of quickstart.e.accountLoginSubmit here with a showContent at the end to allow my account to be shown
			//after loggin in. It was removed for the default function which no longer redirects to my account.
		
			handleapplogincreate : function($form,p)	{
				p.preventDefault();
				if($form)	{
					var formObj = $form.serializeJSON();
					
					if(formObj.pass !== formObj.pass2) {
						_app.u.throwMessage('Sorry, your passwords do not match! Please re-enter your password');
						return;
					}
					
					var tagObj = {
						'callback':function(rd) {
							if(_app.model.responseHasErrors(rd)) {
								$form.anymessage({'message':rd});
							}
							else {
								localStorage.setItem('loadDirectly',true); //acct created set local to skip preview next time
								_app.router.handleURIChange("/");
								_app.u.throwMessage(_app.u.successMsgObject("A gift card has been added to your account, look for it during checkout."));
								//_app.u.throwMessage(_app.u.successMsgObject("Your account has been created!"));
							}
						}
					}
					
					formObj._vendor = "bikinimo";
					_app.ext.bmo_acctcreate.calls.appBuyerCreate.init(formObj,tagObj,'immutable');
					_app.model.dispatchThis('immutable');
				}
				else {
					$('#globalMessaging').anymessage({'message':'$form not passed into bmo_acctcreate.e.handleapplogincreate','gMessage':true});
				}
				return false;
			} //handleAppLoginCreate
			
		} //e [app Events]
	} //r object.
	return r;
}
