jQuery(window).load(function(){
	if(!inIframe()){
		insertPropneutScriptsAndHTML();
	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request.insert_html_in_page!=undefined){
	  insertHtmlInPage(request.insert_html_in_page, request.delete_id, request.delete_class);
      sendResponse({html_inserted: true});
	}
	if(request.call_script_function!=undefined){
		callScriptFunction(request.call_script_function);
        sendResponse({function_called: true});
	}
	if (request.get_page_info!=undefined){
	  var pageinfo = propneut_inspectPage();
      sendResponse({pageinfo: pageinfo});
	}
  });
  
  function insertHtmlInPage(insertHtml, delete_id, delete_class){
	  jQuery('#test'+delete_id).remove();
	  jQuery('.test'+delete_class).remove();
	  jQuery('body').append(insertHtml);
  }
  
  function callScriptFunction(functionName){
	  jQuery('.propneut_function_executer').remove();
	  var insertString='<script class="propneut_function_executer" type="text/javascript">'+functionName+'();</script>';
	  jQuery('body').append(insertString);
  }
  
  function insertPropneutScriptsAndHTML(){
	  chrome.runtime.sendMessage({insert_propneut_scripts_and_html:true}, function(response) {
		  //console.log(response.message);
	  });
  }
  
  window.addEventListener("message", function(event) {
	  if (event.source != window){
		  return;
	  }
	  if (event.data.call_function) {
		if(event.data.functionname=="insertPropneutScriptsAndHTML"){
			insertPropneutScriptsAndHTML(event.data.parametersObject.jquery_exists);
		}
	  }
}, false);

function inIframe(){
    if(window.top === window){
		return false;
	}
	return true;
}