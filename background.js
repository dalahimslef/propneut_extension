var insertscripts='';
var settingsPageScript='';
var popupContent='';
var insertHTML='';
var insertData={};
propneut_getSessionCookie();//Load session id. When the session id is loaded in the function propneut_dataLoaded, the script continues...
chrome.tabs.onUpdated.addListener(propneut_insertSettingScript); 

function propneut_insertSettingScript(tabId, changeInfo, tab){
	//If we are on the url for editing settings, insert the settings script. This allows us to save the settings to the local storage
	//so that the extension can access the settings from there
	if(tab.url==config.edit_extension_settings_url){
		chrome.tabs.executeScript(tabId,{
			code: insertData.settingsPageScript
		});
	}
}

function insertPropneutScriptsAndHtml(tabId){
	//This function might get called before session data is loaded.
	//In that case set the function to be called when we are ready...
	if(typeof insertData.session_cookie == 'undefined'){
		console.log('insertPropneutScriptsAndHtml: session_cookie not yet loaded for tab '+tabId);
	}
	else{
		var settingsJsString=propneut_getSettingsAsJsString();
		var dataToInsert='';
		dataToInsert=dataToInsert+'<script type="text/javascript">'+"\n";
		dataToInsert=dataToInsert+'document.cookie="'+insertData.session_cookie.session_name+'='+insertData.session_cookie.session_id+'";'+"\n";
		dataToInsert=dataToInsert+settingsJsString;
		dataToInsert=dataToInsert+insertData.insertscripts+'</script>'+"\n";
		dataToInsert=dataToInsert+insertData.insertHTML;
		chrome.tabs.sendMessage(tabId, {insert_html_in_page: dataToInsert, delete_id:'', delete_class:''}, function(response){});
	}
}

function propneut_postInsertScriptsAndHtml(){
	console.log('propneut_postInsertScriptsAndHtml...');
	chrome.tabs.getAllInWindow(null, function(tabs){
       for (var i = 0; i < tabs.length; i++) {
	      insertPropneutScriptsAndHtml(tabs[i].id);
		  console.log('insertPropneutScriptsAndHtml in '+tabs[i]);		  
       }
    });
}

function propneut_loadData(url, key, type){
	jQuery.ajax({
	  url: url,
	  data:{},
	  type: 'post',
	  dataType: type,
	  success: function(data, textStatus, jqXHR){propneut_dataLoaded(data, textStatus, jqXHR, key)},
	  error: propneut_dataLoadFailed,
	});
}

function propneut_dataLoaded(data, textStatus, jqXHR, key){
	console.log('propneut_dataLoaded');
	if(key=='session_cookie'){
		console.log('session_cookie loaded:'+JSON.stringify(data));
		insertData[key]=data;
		//Session id is loaded. Now we can load the rest.
		propneut_loadData(chrome.runtime.getURL('insert_files/inject.js'), 'insertscripts', 'text');
		propneut_loadData(chrome.runtime.getURL('insert_files/inject.html'), 'insertHTML', 'text');
		propneut_loadData(chrome.runtime.getURL('insert_files/extension_settings.js'), 'settingsPageScript', 'text');
		propneut_postInsertScriptsAndHtml();
	}
	else{
		data=propneut_replaceInString(data,'<propneut_base_url>', propneut_base_url);
		data=propneut_replaceInString(data,'<propneut_session_id>', insertData.session_cookie.session_id);
		insertData[key]=data;
	}
}

function propneut_dataLoadFailed(jqXHR, textStatus, errorThrown ){
	console.log(errorThrown);
	console.log(jqXHR.responseText);
}


function propneut_getSessionCookie(){
	var d = new Date();
	var currentTimestamp = d.getTime();
	var url=config.get_insertscripts_url+'?currenttime='+currentTimestamp;
	console.log('load session_cookie');
	propneut_loadData(url, 'session_cookie', 'json')
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	 if(request.insert_propneut_scripts_and_html!=undefined){
		insertPropneutScriptsAndHtml(sender.tab.id);
		sendResponse({message: 'html and scripts inserted'});
	}
	if(request.load_setting!=undefined){
	  var loadedValue=localStorage.getItem(request.load_setting);
      sendResponse({setting_name: request.load_setting, setting_value:loadedValue});
	}
	if(request.store_setting!=undefined){
		localStorage.setItem(request.store_setting, request.set_value);
		var loadedValue=localStorage.getItem(request.store_setting);
        sendResponse({setting_name: request.store_setting, setting_value:loadedValue});
	}
	if(request.get_popup_content!=undefined){
		sendResponse({popup_content: popupContent});
	}
  });

 function propneut_getSettingsAsJsString(){
	var ndx;
	var i;
	var jsString='';	
	for(i = 0; i < localStorage.length; i++){
		ndx=localStorage.key(i)
		jsString=jsString+"var "+ndx+"='"+localStorage[ndx]+"';\n";
	}
	
	return jsString;
 }
 
 function propneut_replaceInString(inString, search, replacement) {
    return inString.replace(new RegExp(search, 'g'), replacement);
};