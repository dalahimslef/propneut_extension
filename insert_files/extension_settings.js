var exclude_sites='not loaded';
var only_active_sites='not loaded';
var active_all_or_selected='not loaded';

var onlyActiveSitesList=new Array();
var excludeSitesList=new Array();
var allSitesOrSelectedOnly = 'all_except';

propneut_loadSetting('exclude_sites');
propneut_loadSetting('only_active_sites');
propneut_loadSetting('active_all_or_selected');  
initOnReady();

function propneut_loadSetting(settingName){
    chrome.runtime.sendMessage({load_setting: settingName}, function(response) {
          if(response.setting_name=='exclude_sites'){
                exclude_sites=response.setting_value;     
          }
          if(response.setting_name=='only_active_sites'){
                only_active_sites=response.setting_value;  
          }
          if(response.setting_name=='active_all_or_selected'){
                active_all_or_selected=response.setting_value; 
          }
    });
}

function initOnReady(){
    if((exclude_sites=='not loaded')||(only_active_sites=='not loaded')||(active_all_or_selected=='not loaded')){
        setTimeout(initOnReady, 100);    
    }
    else{
        initSettingsPage();
		addEventHandlers();		
    }
}

function initSettingsPage(){
    jQuery('#exclude-sites-input').val(exclude_sites);
	jQuery('#include-sites-input').val(only_active_sites);
	jQuery('#active-input').val(active_all_or_selected);//when active-input is set the page initializes... 
}


function saveSettings(){
	propneut_setSetting("exclude_sites", jQuery('#exclude-sites-input').val());//localStorage only support strings    
	propneut_setSetting("only_active_sites", jQuery('#include-sites-input').val());//localStorage only support strings
	propneut_setSetting("active_all_or_selected", jQuery('#active-input').val());
}

function propneut_setSetting(settingName, value){
    chrome.runtime.sendMessage({store_setting: settingName, set_value: value}, function(response) {
          if(response.setting_name=='exclude_sites'){
                exclude_sites=response.setting_value;       
          }
          if(response.setting_name=='only_active_sites'){
                only_active_sites=response.setting_value;   
          }
          if(response.setting_name=='active_all_or_selected'){
                active_all_or_selected=response.setting_value;  
          }
    });
               
}

function addEventHandlers(){
	jQuery('#save_settings_button').click(saveSettings);
}



