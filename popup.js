var config=chrome.extension.getBackgroundPage().config;


var selectedTab;
var unselectedTabs;
var messageReplyTimer;
var popupWindowId;
var popupTabId;
var propagandaFavIcon='';
var propagandaTitle='';

window.onload = function() {
	propneut_reloadCaptchaImage();
	propneut_addEventHandlers();
    propneut_getPageInfo();
}

function propneut_getPageInfo(){
			chrome.tabs.query({active: false, currentWindow: true}, function(tabs){
				unselectedTabs=tabs;	
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
							selectedTab=tabs[0];
							propagandaFavIcon=tabs[0].favIconUrl;
							propagandaTitle=tabs[0].title;
							messageReplyTimer=setTimeout(noReplyFromTab, 5000, false);
							chrome.tabs.sendMessage(selectedTab.id, {get_page_info: "get_page_info"}, function(response){
								gotPageInfo(response, false);
							});
					}
				);
			});
}	

function gotPageInfo(response, tab_ndx){
	clearTimeout(messageReplyTimer);
	if(tab_ndx===false){
		if(typeof response !== 'undefined'){
			selectedTab.propneut_pageinfo=response.pageinfo;
		}
		else{
			selectedTab.propneut_pageinfo=false;
		}
	}
	else{
		if(typeof response !== 'undefined'){
			unselectedTabs[tab_ndx].propneut_pageinfo=response.pageinfo;
		}
		else{
			unselectedTabs[tab_ndx].propneut_pageinfo=new Object();
			unselectedTabs[tab_ndx].propneut_pageinfo.title=unselectedTabs[tab_ndx].title;
			unselectedTabs[tab_ndx].propneut_pageinfo.header='';
			unselectedTabs[tab_ndx].propneut_pageinfo.textidentifier='';
		}
	}
	requestNextPageInfo();
}

function requestNextPageInfo(){
	var ndx;
	if(!propneut_allPageInfoSet()){
		ndx=0;
		while(typeof unselectedTabs[ndx].propneut_pageinfo !== 'undefined'){
			ndx++;
		};
		messageReplyTimer=setTimeout(noReplyFromTab, 5000, ndx);
		chrome.tabs.sendMessage(unselectedTabs[ndx].id, {get_page_info: "get_page_info"}, function(response){gotPageInfo(response, ndx);});
	}
	else{
		preparePopup();
	}
}

function noReplyFromTab(tab_ndx){
	if(tab_ndx===false){
		jQuery('#propneut_url_list').html('Error: no propaganda pageinfo received. Request timed out. Browser might be a little busy. Please try to open this popup again...');
	}
	else{
		unselectedTabs[tab_ndx].propneut_pageinfo=new Object();
		unselectedTabs[tab_ndx].propneut_pageinfo.title=unselectedTabs[tab_ndx].title;
		unselectedTabs[tab_ndx].propneut_pageinfo.header='';
		unselectedTabs[tab_ndx].propneut_pageinfo.textidentifier='';
		requestNextPageInfo();
	}
}

function propneut_allPageInfoSet(){
	var ndx;
	if(typeof selectedTab.propneut_pageinfo === 'undefined'){
		return false;
	};
	for(ndx=0; ndx<unselectedTabs.length; ndx++){
		if(typeof unselectedTabs[ndx].propneut_pageinfo === 'undefined'){
			return false;
		};
	}
	return true;
}

function preparePopup(){
	if(unselectedTabs.length==0){
		propneut_openDiv('no_alternative_info_tbody');
	}
	else{
		propneut_openDiv('loading_image_wrapper');
		getTagsForUrl(selectedTab.url, selectedTab.propneut_pageinfo.textidentifier);
	}
}

function getTagsForUrl(neutralizeUrl, textidentifier){
	var data={get_additional_form_elements:'on', neutralize_url:neutralizeUrl, textidentifier:textidentifier};
	jQuery.ajax({
		  url: config.store_alternative_url,
		  data:data,
		  type: 'post',
		  dataType: 'json',
		  success: function(data, textStatus, jqXHR){getTagsForUrl_success(data, textStatus, jqXHR)},
		  error: getTagsForUrl_error,
	});
}

function getTagsForUrl_success(data, textStatus, jqXHR){
	var neutralizeUrl='';
	var url;
	var title;
	var header;
	var textidentifier;
	var urlListHTML='';
	var tabid;
	
	neutralizeUrl=selectedTab.url;
	textidentifier=selectedTab.propneut_pageinfo.textidentifier;
	urlListHTML=urlListHTML+'<option value="_unselected_" selected="selected" disabled="disabled" propneut_translated="Select your alternative...">Select your alternative...</option>';
	for(ndx=0; ndx<unselectedTabs.length; ndx++){
			url=unselectedTabs[ndx].url;
			title='';
			header='';
			tabid=unselectedTabs[ndx].id;
			if(unselectedTabs[ndx].propneut_pageinfo!==false){
					title=unselectedTabs[ndx].propneut_pageinfo.title;
					header=unselectedTabs[ndx].propneut_pageinfo.header;
			}
			urlListHTML=urlListHTML+'<option class="propaganda_neutralizer" id="nautralize_'+ndx+'" favicon_url="'+escapeHtml(unselectedTabs[ndx].favIconUrl)+'" propaganda="'+escapeHtml(neutralizeUrl)+'" antidote="'+escapeHtml(url)+'" header="'+escapeHtml(header)+'" title="'+escapeHtml(title)+'" textidentifier="'+textidentifier+'" tabid="'+tabid+'">'+url+'</option>';
	}
	jQuery('#neutralizer_select').html(urlListHTML);
	    
        if(!data.logged_in){
			propneut_openDiv('not_logged_in_wrapper');			
        }
		else{
			propneut_openDiv('popup_maincontent');
		}

        
		var tagsHTML='';
		var tagsCounter=0;
		var ndx;
		
        tagsHTML=tagsHTML+'<option value="_unselected_" selected="selected" disabled="disabled" style="color:rgb(150,150,150);">Select a topic...</option>';
        for(ndx in  data.tags){
            //tagsHTML=tagsHTML+'<option value="'+encodeURI(data.tags[ndx]['topic_tag'])+'">#'+encodeURI(data.tags[ndx]['topic_tag'])+'</option>';
			tagsHTML=tagsHTML+'<option value="'+escapeHtml(data.tags[ndx]['topic_tag'])+'">#'+escapeHtml(data.tags[ndx]['topic_tag'])+'</option>';			
			tagsCounter++;
		}
        tagsHTML=tagsHTML+'<option new_tag="1" value="_new_tag_">...or enter a new one</option>';
        jQuery('#tag_select').html(tagsHTML);
        if(tagsCounter==0){
			jQuery('#tag_select_warpper').css('display','none');
			jQuery('#new_tag_text_tr').css('display','');    
        }
		else{
			jQuery('#tag_select_warpper').css('display','');
			jQuery('#new_tag_text_tr').css('display','none');
		}
		
		jQuery('#poup_header').html(selectedTab.url);
		jQuery('#poup_header').attr('title', selectedTab.url);
		jQuery('[data-toggle="tooltip"]').tooltip();
}

function getTagsForUrl_error(jqXHR, textStatus, errorThrown){
	jQuery('#error_text_div').html(jqXHR.responseText);
	propneut_openDiv('error_info_div');
}

function propneut_addEventHandlers(){
	//Inline events are not executed. Add the event handlers programatically
	
	jQuery('#propneut_reload_captcha_image').click(function(event){
		propneut_reloadCaptchaImage();
	});
	
	jQuery('#antidote_submit_button').click(function(event){
		post_neutralizer();
	});
	
	jQuery('#settings_image').click(function(event){
		openSettingsWindow();
	});
	
	jQuery('#tag_select').change(function(event) {
		propneut_topicSelectChanged();
	});
	
	jQuery('#neutralizer_select').change(function(event) {
		if(jQuery('#neutralizer_select').val()=='_unselected_'){
			jQuery('#goto_step_2_button').attr('disabled','disabled');
		}
		else{
			jQuery('#goto_step_2_button').removeAttr('disabled');
		}
	});
	
	jQuery('#tag_select').change(function(event) {
		propneut_enableSubmitButton();
	});
	
	jQuery('#new_tag_text').keyup(function(event) {
		propneut_enableSubmitButton();
	});
	
	jQuery('.propneut_info_div_toggler').click(function(event) {
		propneut_toggleInfoDiv(event.target);
	});
	jQuery('#popup_login_button').click(function(event){
		propneut_openLoginPage();
	});
	
	jQuery('#goto_step_2_button').click(function(event){
		post_gotoStep2();
	});
	
	jQuery('#goto_step_1_button').click(function(event){
		post_gotoStep1();
	});
	
	jQuery('#goto_step_3_button').click(function(event){
		post_gotoStep3();
	});
	
	jQuery('#goto_step_2_button_2').click(function(event){
		post_gotoStep2();
	});
}

function post_neutralizer(eventObject){
	var selectedRadio=jQuery('#neutralizer_select').find(':selected');
	var captcha_text='';
	var captchaInput=jQuery('.propneut_captcha_text_input');
    if(typeof captchaInput[0] !== 'undefined'){
        captcha_text=jQuery(captchaInput[0]).val();
    }
	if(typeof selectedRadio[0] !== 'undefined'){
		var propaganda=jQuery(selectedRadio[0]).attr('propaganda');
		var antidote=jQuery(selectedRadio[0]).attr('antidote');
		var propaganda_favicon=propagandaFavIcon;
		var propaganda_title=propagandaTitle;
		var antidote_favicon=jQuery(selectedRadio[0]).attr('favicon_url');
		var title=jQuery(selectedRadio[0]).attr('title');
		var header=jQuery(selectedRadio[0]).attr('header');
		var textidentifier=jQuery(selectedRadio[0]).attr('textidentifier');
		var topicTag=propneut_getTopicTag();
		var fd = new FormData();
		fd.append('propaganda', propaganda);
		fd.append('antidote', antidote);
		fd.append('title', title);
		fd.append('propaganda_title', propaganda_title);
		fd.append('header', header);
		fd.append('textidentifier', textidentifier);
		fd.append('captcha_text', captcha_text);
		fd.append('topic', topicTag);
		fd.append('propaganda_favicon', propaganda_favicon);
		fd.append('antidote_favicon', antidote_favicon);
		jQuery.ajax({
		  url: config.store_alternative_url,
		  data:fd,
		  type: 'post',
		  dataType: 'json',
		  processData: false,
		  contentType: false,
		  success: function(data, textStatus, jqXHR){propneut_post_neutralizer_success(data, textStatus, jqXHR, propaganda, antidote)},
		  error: propneut_post_neutralizer_error,
		});
	}	
}

function propneut_post_neutralizer_success(data, textStatus, jqXHR, propaganda, antidote){
	jQuery('#popup_maincontent').html(data.resulttext);
	jQuery('.popup_login_button').click(function(event){
		propneut_openLoginPage();
	});
}

function propneut_post_neutralizer_error(jqXHR, textStatus, errorThrown){
	jQuery('#popup_maincontent').html('Something went wrong...');
}

function escapeHtml(instring) {
	if(typeof instring!='undefined'){
    return instring
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
	}
	return instring; 
 }
 
 function propneut_reloadCaptchaImage(){
    document.getElementById('propneut_captcha_image').src=config.get_captcha_image_url+'?loadtime=' + new Date().getTime();;
}

function openLoginWindow(){
	var loginUrl = config.popup_loginwindow_url;
	chrome.tabs.create({ url: loginUrl });
	window.close();
}

function openSettingsWindow(){
	var settingsUrl = config.edit_extension_settings_url;
	chrome.tabs.create({ url: settingsUrl });
	window.close();
}



function propneut_getTopicTag(){
	var tag='';
	var customTagDisplay=jQuery('#new_tag_text_tr').css('display');
	if(customTagDisplay=='none'){
		tag=jQuery('#tag_select').find(":selected").val();
	}
	else{
		tag=jQuery('#new_tag_text').val();
	}
	return tag;
}

function propneut_openLoginPage(){
	var url=config.loginwindow_url;
	chrome.tabs.create({ url: url });
}

function propneut_topicSelectChanged(){
	var selectedOption=jQuery('#tag_select').find(":selected");
	var newTag=jQuery(selectedOption[0]).attr('new_tag');
	if (typeof newTag !== typeof undefined && newTag !== false) {
		jQuery('#new_tag_text_tr').css('display','');
	}
	else{
		jQuery('#new_tag_text_tr').css('display','none');
	}
}

function propneut_toggleInfoDiv(element){
    var display=jQuery(element).closest('div').next().css('display');
    jQuery('.propneut_info_div').css('display','none');
    if(display=='none'){
        jQuery(element).closest('div').next().css('display','');    
    }
    else{
        jQuery(element).closest('div').next().css('display','none');
    }
}

function propneut_enableSubmitButton(){
	var selectedTag=jQuery('#tag_select').val();
	var newTag=jQuery('#new_tag_text').val();
	var enableSubmit=false;
	if(selectedTag!='_unselected_'){
		if(selectedTag=='_new_tag_'){
			if(newTag.trim()!=''){
				enableSubmit=true;
			}
		}
		else{
			enableSubmit=true;
		}
	}
	
	if(enableSubmit){
		jQuery('#goto_step_3_button').removeAttr('disabled');
		jQuery('#antidote_submit_button').removeAttr('disabled');
	}
	else{
		jQuery('#goto_step_3_button').attr('disabled', 'disabled');
		jQuery('#antidote_submit_button').attr('disabled', 'disabled');
	}
}

function propneut_openDiv(divId){
	jQuery('.wrapper_div').css('display','none');
	jQuery('#'+divId).css('display','');
}

function post_gotoStep1(){
	jQuery('.step_wrapper').css('display','none');
	jQuery('#step_wrapper_1').css('display','');
	jQuery('#step_wrapper_2').css('display','');
}

function post_gotoStep2(){
	jQuery('.step_wrapper').css('display','none');
	//jQuery('#step_wrapper_1').css('display','');
	jQuery('#step_wrapper_3').css('display','');
}

function post_gotoStep3(){
	jQuery('.step_wrapper').css('display','none');
	jQuery('#step_wrapper_4').css('display','');
}


