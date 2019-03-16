//////////// call_contentscript
function propneut_callContentScriptFunction(functionname,parametersObject){
    var message={
        call_function:true,
        functionname:functionname,
        parametersObject:parametersObject    
    }
    window.postMessage(message, "*");
}


///////////// get_alternatives

var maxGetAlternativesRetries=10;
var getAlternativesRetries=0;
var foundAlternatives=new Array();  
propneut_getAlternatives();

function propneut_makePropagandaCheck(){
    alert("propneut_makePropagandaCheck");
}

function propneut_getAlternatives(){  
    if(propneut_includePageInCheck()){
        var d = new Date();
        var currentTimestamp = d.getTime();
        var current_location=window.location.href;
        var pageinfo = propneut_inspectPage();
        var textidentifier=pageinfo.textidentifier;
        var url="<propneut_base_url>/extension_pages/get_alternatives?no_cache_dummy="+currentTimestamp;
        jQuery.ajax({
          url:url,
          data:{current_location:current_location, textidentifier:textidentifier, propneut_ajax_sessionid:'<propneut_session_id>'},
          type: 'post',
          dataType: 'json',
          success: propneut_gotAlternatives,
          error: propneut_gotAlternativesFail,
        });
    }
}

function propneut_gotAlternatives(data, textStatus, jqXHR){
    if(data.alternatives_count!=undefined){
        if(data.alternatives_count!=0){
            if(data.alternatives_div!=undefined){
                jQuery('#alternatives_list_div').html(propneut_getAlternativesHTML(data));
                jQuery('.propneut_popupowner').click(propneut_displayPopup);
                jQuery('#propneut_reload_captcha_image').click(propneut_displayPopup);
                jQuery('#edit_list_img').click(propneut_openEditListWindow);
                jQuery('.edit_list_opener').click(propneut_openEditListWindow);
                jQuery('#open_alternatives_list_div').click(propneut_openAlternativesList);
                propneut_init();
            }
        }
    }
}

function propneut_gotAlternativesFail(jqXHR, textStatus, errorThrown){
	console.log('propneut_gotAlternativesFail: '+jqXHR.responseText);
    getAlternativesRetries++;
    if(getAlternativesRetries<maxGetAlternativesRetries){
        propneut_getAlternatives();    
    }
}

function propneut_displayBanner(){
    // add foundAlternatives to the HTML...
    
    //...and display   
}

function propneut_includePageInCheck(){
    /*
    //See if this page should be checked for propaganda.
    //Users may have turned off checking for this page.
    //The variables active_all_or_selected, exclude_sites and only_active_sites
    are set by the settings and inserted by the background script.
    active_all_or_selected can be 'only_for' or 'all_except'
    exclude_sites is a json encoded array of all servers which should be excluded
    only_active_sites is a json encoded array of the only servers which should be included
    */    	
    var serverName=window.location.hostname;
    var serverArray;
    if(typeof active_all_or_selected=='undefined'){
        active_all_or_selected='all_except';    
    }
    if(typeof only_active_sites=='undefined'){
        only_active_sites='[]';    
    }
    if(typeof exclude_sites=='undefined'){
        exclude_sites='[]';    
    }
    if(active_all_or_selected=='only_for'){
        serverArray=JSON.parse(only_active_sites);
        if(serverArray.indexOf(serverName) > -1){ //The server is in the array
            return true;    
        }
        else{
            return false;
        }    
    }
    else if(active_all_or_selected=='all_except'){
        serverArray=JSON.parse(exclude_sites);
        if(serverArray.indexOf(serverName) > -1){ //The server is in the array
            return false;    
        }
        else{
            return true;
        }    
    }
    else if(active_all_or_selected=='never'){
        return false;
    }
    return true;
}


//////////////////////////////// page_inspector


function propneut_inspectPage(){   
    var pageinfo=new Object;
    pageinfo.title=propneut_getTitle();
    pageinfo.header=propneut_getHeader();
    pageinfo.elemntinfo=propneut_getElements();
    pageinfo.textidentifier=propneut_getPageTextIdent();      
    return pageinfo;
}

function propneut_getPageTextIdent(){
    //jQuery('body').html('<div>rwefgyj</div>');
    var allDivs=jQuery('div');
    var ndx;
    var ndx2;
    var ndx3;
    var divText;
    var longestText='';
    var longestDiv=-1;
    var childNodes;
    var clonedDiv;
    var textNodes;
    var nodeContent;
    for(ndx=0; ndx<allDivs.length; ndx++){
        clonedDiv=jQuery(allDivs[ndx]).clone();
        try{
            nodeContent=jQuery(clonedDiv).contents();
            textNodes=jQuery(nodeContent).filter(function() { return this.nodeType == 3; });
            divText='';
            for(ndx2=0;ndx2<textNodes.length;ndx2++){
                divText=divText+jQuery(textNodes[ndx2]).text();
            }
        }
        catch(err) {
            console.log(err.message);
        }
        //jQuery(clonedDiv).find(':hidden').remove();
        jQuery(clonedDiv).find('div').remove();
        jQuery(clonedDiv).find('script').remove();
        childNodes=jQuery(clonedDiv).find('*');
        for(ndx3=0;ndx3<childNodes.length;ndx3++){
            try{
                nodeContent=jQuery(childNodes[ndx3]).contents();
                textNodes=jQuery(nodeContent).filter(function() { return this.nodeType == 3; });
                for(ndx2=0;ndx2<textNodes.length;ndx2++){
                    divText=divText+jQuery(textNodes[ndx2]).text();
                }
            }
            catch(err) {
                console.log(err.message);
            }
        }
        divText=divText.replace(/\W/g, '');
        if(divText.length>longestText.length){
            longestText=divText;
            longestDiv=ndx;
        }
    }
    //console.log(longestText);
    var ident=propneut_getTextIdent(longestText);
    ident=ident.replace('"','');
    return ident;
}

function propneut_getTextIdent(text){
    var identLength=20;
    var indexStep=text.length/identLength;
    var ndx;
    var stringIndex;
    var textIdent='';
    for(ndx=1; ndx<=identLength; ndx++){
        stringIndex=ndx*indexStep;
        stringIndex=Math.floor(stringIndex);
        textIdent=textIdent+text.charAt(stringIndex);
    }
    return textIdent;
}

function propneut_getElements(){
    var elementList=new Array();
    var elementIndex=0;
    var ndx;
    var foundElements=jQuery('img');
    for(ndx=0; ndx<foundElements.length; ndx++){
        elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
        elementIndex++;
    }
    var foundElements=jQuery('iframe');
    for(ndx=0; ndx<foundElements.length; ndx++){
        elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
        elementIndex++;
    }
    var foundElements=jQuery('object');
    for(ndx=0; ndx<foundElements.length; ndx++){
        elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
        elementIndex++;
    }
    var foundElements=jQuery('embed');
    for(ndx=0; ndx<foundElements.length; ndx++){
        elementList[elementIndex]=propneut_getElementProperties(foundElements[ndx]);
        elementIndex++;
    }
    return elementList;
}

function propneut_getElementProperties(element){
    var offset=jQuery(element).offset();
    var width=jQuery(element).width();
    var height=jQuery(element).height();
    var left=offset.left;
    var top=offset.top;
    var elementProperties=new Object();
    elementProperties.width=width;
    elementProperties.height=height;
    elementProperties.left=left;
    elementProperties.top=top;
    return elementProperties;
}

function propneut_getTitle(){
    var title='';
    var allTitles=jQuery('title');
    if (typeof allTitles[0] !== 'undefined') {
        title=jQuery(allTitles[0]).text();
    }
    title=title.replace(/(?:\r\n|\r|\n)/g, '');
    title=title.replace(/\s{2,}/g, ' ');
    return title;
}

function propneut_getHeader(){
    var header='';
    var allHeaders=jQuery('h1');
    if (typeof allHeaders[0] !== 'undefined') {
        header=jQuery(allHeaders[0]).text();
    }
    header=header.replace(/(?:\r\n|\r|\n)/g, '');
    header=header.replace(/\s{2,}/g, ' ');
    return header;
}



////////////////////// stamp_page



function propneut_init(){
    propneut_setZindex();
    propneut_setStamp();
    propneut_showBadge();
    propneut_initPopups();      
}

function propneut_showBadge(){
    jQuery('#propneut_badge').css('display','');
}

function propneut_setZindex(){
    var allElements=jQuery('*');
    var maxZindex=1;
    var nextZindex;
    var ndx;
    for(ndx=0; ndx<allElements.length; ndx++){
        nextZindex=parseInt(jQuery(allElements[ndx]).css('z-index'));
        if(!isNaN(nextZindex)){
            if(nextZindex>maxZindex){
                maxZindex=nextZindex;
            }
        }
    }                      
    jQuery('#propneut_badge').css('z-index',maxZindex+1);
    jQuery('#propneut_stamp').css('z-index',maxZindex+2);
    jQuery('#propneut_antidotes').css('z-index',maxZindex+3);  
}

function propneut_closePopup(){  
    jQuery('#propneut_antidotes').css('display','none');     
}

function propneut_openPopup(){  
    jQuery('#propneut_antidotes').css('display','');     
}

function propneut_closeBadge(){
   jQuery('#propneut_badge').css('display','none');
}

function propneut_setStamp(){
    var startStampwidth=800;
    var scrollPos = jQuery(document).scrollTop();
    var windowWidth = jQuery(window).width();
    
    var stampTopPos=scrollPos+200;
    jQuery('#propneut_stamp').css('top', stampTopPos+'px');
    jQuery('#propneut_stamp').css('left', '400px');
    jQuery('#propneut_stamp_image').css('width', startStampwidth+'px');
    jQuery('#propneut_stamp').css('display', '');   
    setTimeout(propneut_animateStamp,200);
}

function propneut_animateStamp(){
    var finalStampwidth=500;
    var stepsize=250;
    var stampWidth=jQuery('#propneut_stamp_image').width();
	
	//var finalStampAlpha=60;
	var finalStampAlpha=0;
    var alphaStepsize=5;
    var stampAlpha=parseInt(parseFloat(jQuery('#propneut_stamp_image').css('opacity'))*100);
	
    if(stampWidth>finalStampwidth){
        stampWidth=stampWidth-stepsize;
        if(stampWidth<finalStampwidth){
            stampWidth=finalStampwidth;
        }
        jQuery('#propneut_stamp_image').css('width', stampWidth+'px');
        setTimeout(propneut_animateStamp,10);    
    }
	else{
		if(stampAlpha>finalStampAlpha){
			stampAlpha=stampAlpha-alphaStepsize;
			if(stampAlpha<finalStampAlpha){
				stampAlpha=finalStampAlpha;
			}
			jQuery('#propneut_stamp_image').css('opacity', stampAlpha/100);
			jQuery('#propneut_stamp_image').css('filter', 'alpha(opacity='+stampAlpha+')');
			setTimeout(propneut_animateStamp,200);
		}
	}
}

function propneut_openInfoDiv(){
    jQuery('.display_info_div').css('display','');
}

function propneut_closeInfoDiv(){
    jQuery('.display_info_div').css('display','none');
}

function propneut_openEditListWindow(){   
    var p_url=jQuery('#edit_list_img').attr('p_url');
    var t_ident=jQuery('#edit_list_img').attr('t_ident');
    var editUrl='<propneut_base_url>/pages/rate_antidote/rate_antidote.php?p_url='+p_url+'&t_ident='+t_ident;
    var newWin=window.open(editUrl);  
    if(!newWin || newWin.closed || typeof newWin.closed=='undefined'){ 
        window.location=editUrl;
    }
}

function propneut_openAlternativesList(){   
    var p_url=jQuery('#open_alternatives_list_div').attr('p_url');
    var t_ident=jQuery('#edit_list_img').attr('t_ident');
    var listUrl='<propneut_base_url>/pages/antidote_list/antidote_list.php?p_url='+p_url+'&t_ident='+t_ident;
    window.open(listUrl);
}




////////////////////// overlay_popup

function propneut_initPopups(){    
    var popupOwners=jQuery('.propneut_popupowner');       
    var ownerId;
    for(ndx=0;ndx<popupOwners.length;ndx++){
        jQuery(popupOwners[ndx]).next().css('display', 'none');
        ownerId="propneut_popupowner_"+ndx;
        jQuery(popupOwners[ndx]).attr('id',ownerId);
        onclickFunction="propneut_callContentScriptFunction('propneut_displayPopup',{ownerelement_id:'"+ownerId+"'});"        
        jQuery(popupOwners[ndx]).attr('onclick',onclickFunction);              
    }           
    jQuery('.propneut_rateit_popup').mouseleave(propneut_closePopups);                
}

function propneut_closePopups(){
    jQuery('.propneut_rateit_popup_arrow').css('display','');
    jQuery('.propneut_rateit_popup_arrow_inner').css('display','');
    jQuery('.propneut_rateit_popup').css('display','');
}

function propneut_displayPopup(clickedElement){  
    var ownerelementId=jQuery(clickedElement).attr('id');        
    propneut_closePopups();
    var innerArrowTop=-10;  
    jQuery('.propneut_rateit_popup_arrow').css('top',innerArrowTop+'px');
    jQuery('.propneut_rateit_popup_arrow_inner').css('top',innerArrowTop+'px');     
    var tableHeight=jQuery('#propneut_alternatives_table').height();
    jQuery('.propneut_rateit_popup').css('min-height', tableHeight+'px');
    var ownerOffset=jQuery("#"+ownerelementId).offset();
    var parentOffset=jQuery("#propneut_rateit_popup").parent().offset();
    var setOffsetLeft=ownerOffset.left-parentOffset.left;
    setOffsetLeft=setOffsetLeft+50;
    var setOffsetTop=ownerOffset.top-parentOffset.top;
    setOffsetTop=setOffsetTop-25;
    var arrowOffset=0;
    if(setOffsetTop>100){
        arrowOffset=setOffsetTop-100;
        setOffsetTop=100;
        arrowOffset=arrowOffset+innerArrowTop;
        jQuery('.propneut_rateit_popup_arrow').css('top',arrowOffset+'px');
        jQuery('.propneut_rateit_popup_arrow_inner').css('top',arrowOffset+'px');                                                      
    }
    
    var divContent=jQuery("#"+ownerelementId).next().html();
    jQuery('#propneut_rateit_popup_content').html(divContent);
    jQuery("#"+ownerelementId).find('.propneut_rateit_popup_arrow').css('display','block');
    jQuery("#"+ownerelementId).find('.propneut_rateit_popup_arrow_inner').css('display','block');
    jQuery('.propneut_rateit_popup').css('left',setOffsetLeft+'px');
    jQuery('.propneut_rateit_popup').css('top',setOffsetTop+'px');
    jQuery('.propneut_rateit_popup').css('display','block');
    /*alert(setOffsetLeft);
    alert(setOffsetTop);*/    
}

function propneut_showAllAntidotesList(){
    jQuery('#propneut_main_popup_content_table').css('display','none');
    jQuery('#propneut_all_links_div').css('display','');  
}

function propneut_hideAllAntidotesList(){               
    jQuery('#propneut_main_popup_content_table').css('display','');
    jQuery('#propneut_all_links_div').css('display','none');
}



/////////////////////// reload_captcha_image

function propneut_reloadCaptchaImage(){
    document.getElementById('propneut_captcha_image').src='<propneut_base_url>/includes/captcha/get_captcha_image';
}

/////////////////////// propneut_getAlternativesHTML

function propneut_getAlternativesHTML(data){
	var returnHTML='';
	var ndx;
	returnHTML=returnHTML+'<div style="position:relative;float:left;font-size:3em;font-weight:bold;">'+data.alternatives_div.p_url+'<img style="position:absolute;z-index:10;right:-80px;bottom:-10px;width:150px;opacity:0.6;filter:alpha(opacity=60);" src="<propneut_base_url>/images/stamp.png"/></div>';
	returnHTML=returnHTML+'<div style="clear:both;"></div>';
	returnHTML=returnHTML+'<div>';
	
	returnHTML=returnHTML+'<div style="padding:30px;">';
	returnHTML=returnHTML+'<ul style="list-style-type:disc;">';
	for(ndx in data.alternatives_div.alternatives){
			returnHTML=returnHTML+'<li><span style="cursor:pointer;color:blue;text-decoration:underline;" onclick="var newWindow=window.open(\''+data.alternatives_div.alternatives[ndx]['url_alternative']+'\');if(!newWin || newWin.closed || typeof newWin.closed==\'undefined\'){window.location=\''+data.alternatives_div.alternatives[ndx]['url_alternative']+'\'}" title="'+data.alternatives_div.alternatives[ndx]['alternative_title']+'"">'+data.alternatives_div.alternatives[ndx]['url_alternative']+'</span></li>';
	}
	returnHTML=returnHTML+'</ul>';
	returnHTML=returnHTML+'</div>';
	
	returnHTML=returnHTML+'<div style="position:absolute;bottom:0px;">';
	if(data.alternatives_div.total_alternatives_count>data.alternatives_div.display_list_count){
		returnHTML=returnHTML+'<div>';
		returnHTML=returnHTML+'Showing top '+data.alternatives_div.display_list_count+' of '+data.alternatives_div.total_alternatives_count+' suggested links.';
		returnHTML=returnHTML+' See the whole list ';
		returnHTML=returnHTML+'<span id="open_alternatives_list_div" p_url="'+data.alternatives_div.p_url+'" t_ident="'+data.alternatives_div.t_ident+'" style="cursor: pointer;color: blue;text-decoration: underline;" onclick="propneut_openAlternativesList();">here</span>';
		returnHTML=returnHTML+'</div>';	
	}
	returnHTML=returnHTML+'<div>';
	returnHTML=returnHTML+'To help maintain this list of links go ';
    returnHTML=returnHTML+'<span style="cursor: pointer;color: blue;text-decoration: underline;" onclick="window.open(\''+data.alternatives_div.edit_ranking_url+'\');">here</span>';
    returnHTML=returnHTML+'</div>';
	returnHTML=returnHTML+'</div>';
	
	returnHTML=returnHTML+'</div>';
	
	return returnHTML;
}

///////////////////////// add_event_listeners

jQuery('#badge_image').click(propneut_openPopup);
jQuery('#popup_close_image').click(propneut_closePopup);
jQuery('#open_info_image').click(propneut_openInfoDiv);
jQuery('#close_info_image').click(propneut_closeInfoDiv);
jQuery('#badge_closer_image').click(propneut_closeBadge);  
