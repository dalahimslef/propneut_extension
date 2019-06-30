var exclude_sites='not loaded';
var only_active_sites='not loaded';
var active_all_or_selected='not loaded';

var onlyActiveSitesList=new Array();
var excludeSitesList=new Array();
var allSitesOrSelectedOnly = 'all_except';

addEventHandlers();
propneut_loadSetting('exclude_sites');
propneut_loadSetting('only_active_sites');
propneut_loadSetting('active_all_or_selected');  
initOnReady();

function propneut_siteSelectChanged(){
    var selected=jQuery('#sites_select').val();
    
    jQuery('.sites_list_div').css('display','none');
    
    if(selected=='all_except'){
		jQuery('#only_for_sites_div').css('display','');
    }
    
    if(selected=='only_for'){
		jQuery('#all_except_sites_div').css('display','');
    }
}

function propneut_fillSitesLists(){
    var insertHTML='';
    var ndx;
    for(ndx in onlyActiveSitesList){
        insertHTML=insertHTML+'<tr style="background-color:transparent;"><td style="border:0px;text-align:left;">'+onlyActiveSitesList[ndx]+'</td><td style="border:0px;text-align:left;"><span class="clickable_text delete_active_site_button" propneut_site="'+ndx+'">[delete...]</span></td></tr>';    
    }
    jQuery('#only_active_sites_tbody').html(insertHTML);
    
    insertHTML='';
    for(ndx in excludeSitesList){
        insertHTML=insertHTML+'<tr style="background-color:transparent;"><td style="border:0px;text-align:left;">'+excludeSitesList[ndx]+'</td><td style="border:0px;text-align:left;"><span class="clickable_text delete_exlude_button" propneut_site="'+ndx+'">[delete...]</span></td></tr>';    
    }
    jQuery('#exclude_sites_tbody').html(insertHTML);
	
    jQuery('.delete_active_site_button').click(propneut_deleteFromOnlyActiveSitesList);
	jQuery('.delete_exlude_button').click(propneut_deleteFromExcludeSitesList);    
}

function propneut_deleteFromExcludeSitesList(event){
	ndx=jQuery(event.target).attr('propneut_site');
    excludeSitesList.splice(ndx,1);
    propneut_fillSitesLists();   
}

function propneut_deleteFromOnlyActiveSitesList(event){
	ndx=jQuery(event.target).attr('propneut_site');
    onlyActiveSitesList.splice(ndx,1);
    propneut_fillSitesLists();    
}

function propneut_addToOnlyActiveSites(){
    var site=jQuery('#add_to_only_active_sites').val();
	if(!onlyActiveSitesList.includes(site)){
		var ndx=onlyActiveSitesList.length;
		onlyActiveSitesList[ndx]=site;
		propneut_fillSitesLists();
	}    
}

function propneut_addToExcludeSites(){
    var site=jQuery('#add_to_exclude_sites').val();
	if(!excludeSitesList.includes(site)){
		var ndx=excludeSitesList.length;
		excludeSitesList[ndx]=site;
		propneut_fillSitesLists();
	}    
}

function addEventHandlers(){
	jQuery('#sites_select').change(propneut_siteSelectChanged);
	jQuery('#add_to_only_active_sites_button').click(propneut_addToOnlyActiveSites);
	jQuery('#add_to_exclude_sites_button').click(propneut_addToExcludeSites);
    jQuery('#save_settings_button').click(saveSettings);
    
}

function initOnReady(){
    if((exclude_sites=='not loaded')||(only_active_sites=='not loaded')||(active_all_or_selected=='not loaded')){
        setTimeout(initOnReady, 100);    
    }
    else{
        initSettingsPage();    
    }
}

function initSettingsPage(){
    try{
        excludeSitesList=JSON.parse(exclude_sites);//localStorage only support strings
    }
    catch(err) {
    }
    if(!(excludeSitesList instanceof Array)){
        excludeSitesList = new Array();    
    }
    try{
        onlyActiveSitesList=JSON.parse(only_active_sites);//localStorage only support strings
    }
    catch(err) {
    }
    if(!(onlyActiveSitesList instanceof Array)){
        onlyActiveSitesList = new Array();    
    }
    allSitesOrSelectedOnly=active_all_or_selected;
    if((allSitesOrSelectedOnly != 'all_except')&&(allSitesOrSelectedOnly != 'only_for')&&(allSitesOrSelectedOnly != 'never')){
        allSitesOrSelectedOnly = 'all_except';    
    }
    propneut_fillSitesLists();
	jQuery('#sites_select').val(allSitesOrSelectedOnly);
    propneut_siteSelectChanged();
}


function saveSettings(){
	propneut_setSetting("exclude_sites", JSON.stringify(excludeSitesList));//localStorage only support strings    
	propneut_setSetting("only_active_sites", JSON.stringify(onlyActiveSitesList));//localStorage only support strings
	var activeFor=jQuery('#sites_select').val();
    propneut_setSetting("active_all_or_selected", activeFor);
}



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

function setSiteListHTML(selectId, siteListId){
    var options=jQuery('#'+selectId).find('option');
    var ndx;
    var sitename;
    var sites={};
    for(ndx=0;ndx<options.length;ndx++){
        sitename=jQuery(options[ndx]).text();
        sites[sitename]=sitename;    
    }
    
    var siteListHTML='';
    var counter=0;
    for(ndx in sites){
        if(counter!=0){
            siteListHTML=siteListHTML+', ';    
        }
        siteListHTML=siteListHTML+'<div class="site_list_div">'+sites[ndx]+'</div>'    
        counter++;
    }
    jQuery('#'+siteListId).html(siteListHTML);    
}


